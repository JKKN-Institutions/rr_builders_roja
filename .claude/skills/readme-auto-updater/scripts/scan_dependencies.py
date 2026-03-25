#!/usr/bin/env python3
"""
Dependencies Scanner - Analyzes package.json for README generation.

Scans:
- Production dependencies
- Development dependencies
- Scripts and commands
- Project metadata
"""

import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime


# Known packages with descriptions
PACKAGE_DESCRIPTIONS = {
    # Frameworks
    'next': 'React framework for production',
    'react': 'UI component library',
    'react-dom': 'React DOM renderer',

    # Database & Backend
    '@supabase/supabase-js': 'Supabase client SDK',
    '@supabase/ssr': 'Supabase SSR helpers',
    '@supabase/auth-helpers-nextjs': 'Supabase Auth for Next.js',
    'prisma': 'Database ORM',
    '@prisma/client': 'Prisma client',

    # UI Components
    '@radix-ui/react-dialog': 'Accessible dialog component',
    '@radix-ui/react-dropdown-menu': 'Accessible dropdown menu',
    '@radix-ui/react-select': 'Accessible select component',
    '@radix-ui/react-tabs': 'Accessible tabs component',
    '@radix-ui/react-toast': 'Accessible toast notifications',
    'class-variance-authority': 'CSS class variance utility',
    'clsx': 'Conditional className utility',
    'tailwind-merge': 'Tailwind class merger',
    'lucide-react': 'Icon library',

    # State & Data
    '@tanstack/react-query': 'Data fetching & caching',
    '@tanstack/react-table': 'Headless table library',
    'zustand': 'State management',
    'zod': 'Schema validation',
    'react-hook-form': 'Form management',
    '@hookform/resolvers': 'Form validation resolvers',

    # Styling
    'tailwindcss': 'Utility-first CSS framework',
    'autoprefixer': 'CSS vendor prefixing',
    'postcss': 'CSS transformation tool',

    # Development
    'typescript': 'TypeScript compiler',
    'eslint': 'Code linting',
    'prettier': 'Code formatting',
    '@types/node': 'Node.js type definitions',
    '@types/react': 'React type definitions',

    # Testing
    'jest': 'Testing framework',
    '@testing-library/react': 'React testing utilities',
    'vitest': 'Vite-native testing',
    'playwright': 'E2E testing framework',
    'cypress': 'E2E testing framework',
}


def get_project_root(start_path: str = '.') -> Path:
    """Find project root by looking for package.json."""
    current = Path(start_path).resolve()
    while current != current.parent:
        if (current / 'package.json').exists():
            return current
        current = current.parent
    return Path(start_path).resolve()


def read_package_json(root: Path) -> Optional[Dict]:
    """Read and parse package.json."""
    package_file = root / 'package.json'
    if not package_file.exists():
        return None

    try:
        return json.loads(package_file.read_text(encoding='utf-8'))
    except Exception:
        return None


def categorize_dependencies(deps: Dict[str, str]) -> Dict[str, List[Dict]]:
    """Categorize dependencies by type."""
    categories = {
        'framework': [],
        'database': [],
        'ui': [],
        'state': [],
        'styling': [],
        'utilities': [],
        'other': [],
    }

    category_patterns = {
        'framework': ['next', 'react', 'vue', 'angular', 'svelte'],
        'database': ['supabase', 'prisma', 'drizzle', 'mongoose', 'pg', 'mysql', 'redis'],
        'ui': ['radix', 'headless', 'shadcn', 'chakra', 'mui', 'ant', 'lucide', 'heroicons'],
        'state': ['tanstack', 'zustand', 'redux', 'jotai', 'recoil', 'query', 'swr'],
        'styling': ['tailwind', 'styled', 'emotion', 'sass', 'postcss'],
    }

    for name, version in deps.items():
        dep_info = {
            'name': name,
            'version': version,
            'description': PACKAGE_DESCRIPTIONS.get(name, ''),
        }

        categorized = False
        for category, patterns in category_patterns.items():
            if any(p in name.lower() for p in patterns):
                categories[category].append(dep_info)
                categorized = True
                break

        if not categorized:
            categories['other' if not dep_info['description'] else 'utilities'].append(dep_info)

    return categories


def extract_tech_stack(pkg: Dict) -> List[Dict]:
    """Extract main tech stack from dependencies."""
    stack = []
    deps = {**pkg.get('dependencies', {}), **pkg.get('devDependencies', {})}

    # Check for frameworks
    if 'next' in deps:
        version = deps['next'].replace('^', '').replace('~', '')
        stack.append({
            'name': 'Next.js',
            'version': version,
            'category': 'Framework',
        })

    if 'react' in deps:
        version = deps['react'].replace('^', '').replace('~', '')
        stack.append({
            'name': 'React',
            'version': version,
            'category': 'UI Library',
        })

    # Database
    if '@supabase/supabase-js' in deps or '@supabase/ssr' in deps:
        version = deps.get('@supabase/supabase-js', deps.get('@supabase/ssr', '')).replace('^', '').replace('~', '')
        stack.append({
            'name': 'Supabase',
            'version': version,
            'category': 'Database',
        })

    if '@prisma/client' in deps:
        stack.append({
            'name': 'Prisma',
            'version': deps['@prisma/client'].replace('^', '').replace('~', ''),
            'category': 'ORM',
        })

    # Styling
    if 'tailwindcss' in deps:
        stack.append({
            'name': 'Tailwind CSS',
            'version': deps['tailwindcss'].replace('^', '').replace('~', ''),
            'category': 'Styling',
        })

    # TypeScript
    if 'typescript' in deps:
        stack.append({
            'name': 'TypeScript',
            'version': deps['typescript'].replace('^', '').replace('~', ''),
            'category': 'Language',
        })

    return stack


def extract_scripts(pkg: Dict) -> List[Dict]:
    """Extract npm scripts with descriptions."""
    scripts = pkg.get('scripts', {})
    result = []

    script_descriptions = {
        'dev': 'Start development server',
        'build': 'Build for production',
        'start': 'Start production server',
        'lint': 'Run linter',
        'test': 'Run tests',
        'test:watch': 'Run tests in watch mode',
        'test:coverage': 'Run tests with coverage',
        'format': 'Format code',
        'typecheck': 'Check TypeScript types',
        'db:push': 'Push database schema',
        'db:migrate': 'Run database migrations',
        'db:seed': 'Seed database',
        'db:studio': 'Open database studio',
    }

    for name, command in scripts.items():
        result.append({
            'name': name,
            'command': command,
            'description': script_descriptions.get(name, ''),
        })

    return result


def scan_project_dependencies(project_path: str = '.') -> Dict:
    """Main function to scan project dependencies."""
    root = get_project_root(project_path)
    pkg = read_package_json(root)

    if not pkg:
        return {
            'scanned_at': datetime.now().isoformat(),
            'error': 'package.json not found',
        }

    deps = pkg.get('dependencies', {})
    dev_deps = pkg.get('devDependencies', {})

    result = {
        'scanned_at': datetime.now().isoformat(),
        'project_root': str(root),
        'metadata': {
            'name': pkg.get('name', 'unknown'),
            'version': pkg.get('version', '0.0.0'),
            'description': pkg.get('description', ''),
            'private': pkg.get('private', False),
        },
        'tech_stack': extract_tech_stack(pkg),
        'scripts': extract_scripts(pkg),
        'dependencies': {
            'production': categorize_dependencies(deps),
            'development': categorize_dependencies(dev_deps),
        },
        'summary': {
            'total_dependencies': len(deps),
            'total_dev_dependencies': len(dev_deps),
            'has_typescript': 'typescript' in dev_deps or 'typescript' in deps,
            'has_testing': any(t in str(dev_deps) for t in ['jest', 'vitest', 'cypress', 'playwright']),
            'has_linting': 'eslint' in dev_deps or 'eslint' in deps,
        }
    }

    return result


def main():
    """CLI entry point."""
    import sys

    project_path = sys.argv[1] if len(sys.argv) > 1 else '.'
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    result = scan_project_dependencies(project_path)

    output = json.dumps(result, indent=2)

    if output_file:
        Path(output_file).write_text(output, encoding='utf-8')
        print(f"Dependencies scan saved to: {output_file}")
    else:
        print(output)


if __name__ == '__main__':
    main()
