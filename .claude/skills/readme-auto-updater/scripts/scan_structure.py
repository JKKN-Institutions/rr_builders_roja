#!/usr/bin/env python3
"""
Structure Scanner - Analyzes Next.js project structure for README generation.

Scans:
- App router pages and layouts
- Components hierarchy
- Services/hooks/types organization
- Module completion status
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime


# Standard Next.js 15 App Router structure
NEXTJS_STRUCTURE = {
    'app': 'Next.js App Router pages and layouts',
    'components': 'Reusable UI components',
    'services': 'Supabase service layer',
    'hooks': 'Custom React hooks',
    'types': 'TypeScript type definitions',
    'lib': 'Utility functions and configurations',
    'utils': 'Helper utilities',
    'contexts': 'React context providers',
    'stores': 'State management stores',
}

# File patterns for different categories
PATTERNS = {
    'page': r'page\.(tsx|ts|jsx|js)$',
    'layout': r'layout\.(tsx|ts|jsx|js)$',
    'component': r'\.(tsx|jsx)$',
    'service': r'(service|api)\.(ts|js)$',
    'hook': r'^use[A-Z].*\.(ts|tsx)$',
    'type': r'(types?|interfaces?)\.(ts|d\.ts)$',
}


def get_project_root(start_path: str = '.') -> Path:
    """Find project root by looking for package.json."""
    current = Path(start_path).resolve()
    while current != current.parent:
        if (current / 'package.json').exists():
            return current
        current = current.parent
    return Path(start_path).resolve()


def scan_directory_tree(root: Path, src_path: Path) -> Dict:
    """Generate directory tree structure."""
    tree = {}

    if not src_path.exists():
        return tree

    for item in sorted(src_path.iterdir()):
        if item.name.startswith('.') or item.name == 'node_modules':
            continue

        rel_path = item.relative_to(root)

        if item.is_dir():
            tree[item.name] = {
                'type': 'directory',
                'description': NEXTJS_STRUCTURE.get(item.name, ''),
                'children': len(list(item.rglob('*'))) if item.is_dir() else 0,
            }
        else:
            tree[item.name] = {
                'type': 'file',
                'extension': item.suffix,
            }

    return tree


def scan_modules(app_path: Path) -> List[Dict]:
    """Scan app router for modules/features."""
    modules = []

    if not app_path.exists():
        return modules

    # Skip these directories as they're not feature modules
    skip_dirs = {'api', 'fonts', '_components', '_lib'}

    for item in app_path.iterdir():
        if item.is_dir() and not item.name.startswith(('_', '.', '(')) and item.name not in skip_dirs:
            module_info = analyze_module(item)
            modules.append(module_info)

    return modules


def analyze_module(module_path: Path) -> Dict:
    """Analyze a single module for completeness."""
    module_name = module_path.name

    # Count different file types
    pages = list(module_path.rglob('page.*'))
    layouts = list(module_path.rglob('layout.*'))
    components = list(module_path.rglob('*.tsx')) + list(module_path.rglob('*.jsx'))

    # Determine status based on content
    if len(pages) > 0 and len(components) > 2:
        status = 'complete'
        status_icon = '✅'
    elif len(pages) > 0:
        status = 'in_progress'
        status_icon = '🔄'
    else:
        status = 'planned'
        status_icon = '📋'

    # Try to extract description from README or comments
    description = extract_module_description(module_path)

    return {
        'name': module_name,
        'path': str(module_path),
        'status': status,
        'status_icon': status_icon,
        'pages': len(pages),
        'components': len(components),
        'description': description,
    }


def extract_module_description(module_path: Path) -> str:
    """Try to extract module description from files."""
    # Check for README in module
    readme = module_path / 'README.md'
    if readme.exists():
        content = readme.read_text(encoding='utf-8')
        # Get first paragraph
        lines = content.strip().split('\n')
        for line in lines:
            if line.strip() and not line.startswith('#'):
                return line.strip()[:100]

    # Check page.tsx for comments
    page_file = module_path / 'page.tsx'
    if page_file.exists():
        content = page_file.read_text(encoding='utf-8')
        # Look for JSDoc comment
        match = re.search(r'/\*\*\s*\n\s*\*\s*(.+?)\n', content)
        if match:
            return match.group(1).strip()[:100]

    # Generate from module name
    return f"{module_name_to_title(module_path.name)} module"


def module_name_to_title(name: str) -> str:
    """Convert module-name to Title Case."""
    return ' '.join(word.capitalize() for word in name.replace('-', ' ').replace('_', ' ').split())


def scan_components(components_path: Path) -> Dict:
    """Scan components directory."""
    result = {
        'total': 0,
        'categories': {},
        'list': [],
    }

    if not components_path.exists():
        return result

    for item in components_path.rglob('*.tsx'):
        if item.name.startswith('_'):
            continue

        result['total'] += 1

        # Categorize by parent folder
        parent = item.parent.name if item.parent != components_path else 'root'
        if parent not in result['categories']:
            result['categories'][parent] = 0
        result['categories'][parent] += 1

        # Add to list (limit to avoid huge output)
        if len(result['list']) < 50:
            result['list'].append({
                'name': item.stem,
                'path': str(item.relative_to(components_path)),
                'category': parent,
            })

    return result


def generate_tree_string(root: Path, src_path: Path, max_depth: int = 2) -> str:
    """Generate ASCII tree representation."""
    lines = []

    def walk(path: Path, prefix: str = '', depth: int = 0):
        if depth > max_depth:
            return

        items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name))
        items = [i for i in items if not i.name.startswith('.') and i.name != 'node_modules']

        for i, item in enumerate(items):
            is_last = i == len(items) - 1
            connector = '└── ' if is_last else '├── '

            if item.is_dir():
                desc = NEXTJS_STRUCTURE.get(item.name, '')
                comment = f'  # {desc}' if desc else ''
                lines.append(f'{prefix}{connector}{item.name}/{comment}')

                extension = '    ' if is_last else '│   '
                walk(item, prefix + extension, depth + 1)
            else:
                lines.append(f'{prefix}{connector}{item.name}')

    if src_path.exists():
        lines.append(f'{src_path.name}/')
        walk(src_path, '')

    return '\n'.join(lines)


def scan_project_structure(project_path: str = '.') -> Dict:
    """Main function to scan entire project structure."""
    root = get_project_root(project_path)
    src = root / 'src'
    app = src / 'app' if (src / 'app').exists() else root / 'app'
    components = src / 'components' if (src / 'components').exists() else root / 'components'

    result = {
        'scanned_at': datetime.now().isoformat(),
        'project_root': str(root),
        'structure': {
            'has_src': (root / 'src').exists(),
            'has_app_router': app.exists(),
            'tree': scan_directory_tree(root, src if src.exists() else root),
            'tree_string': generate_tree_string(root, src if src.exists() else root),
        },
        'modules': scan_modules(app),
        'components': scan_components(components),
        'summary': {
            'total_modules': 0,
            'complete_modules': 0,
            'in_progress_modules': 0,
            'total_components': 0,
        }
    }

    # Calculate summary
    result['summary']['total_modules'] = len(result['modules'])
    result['summary']['complete_modules'] = len([m for m in result['modules'] if m['status'] == 'complete'])
    result['summary']['in_progress_modules'] = len([m for m in result['modules'] if m['status'] == 'in_progress'])
    result['summary']['total_components'] = result['components']['total']

    return result


def main():
    """CLI entry point."""
    import sys

    project_path = sys.argv[1] if len(sys.argv) > 1 else '.'
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    result = scan_project_structure(project_path)

    output = json.dumps(result, indent=2)

    if output_file:
        Path(output_file).write_text(output, encoding='utf-8')
        print(f"Structure scan saved to: {output_file}")
    else:
        print(output)


if __name__ == '__main__':
    main()
