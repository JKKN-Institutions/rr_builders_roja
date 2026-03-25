#!/usr/bin/env python3
"""
API Scanner - Extracts API routes, server actions, and type definitions.

Scans:
- Next.js API routes (app/api/*)
- Server actions (use server)
- TypeScript interfaces and types
- Service layer functions
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime


def get_project_root(start_path: str = '.') -> Path:
    """Find project root by looking for package.json."""
    current = Path(start_path).resolve()
    while current != current.parent:
        if (current / 'package.json').exists():
            return current
        current = current.parent
    return Path(start_path).resolve()


def scan_api_routes(api_path: Path) -> List[Dict]:
    """Scan Next.js API routes."""
    routes = []

    if not api_path.exists():
        return routes

    for route_file in api_path.rglob('route.ts'):
        route_info = extract_route_info(route_file, api_path)
        if route_info:
            routes.append(route_info)

    # Also check for route.js
    for route_file in api_path.rglob('route.js'):
        route_info = extract_route_info(route_file, api_path)
        if route_info:
            routes.append(route_info)

    return routes


def extract_route_info(route_file: Path, api_base: Path) -> Optional[Dict]:
    """Extract information from a route file."""
    try:
        content = route_file.read_text(encoding='utf-8')
    except Exception:
        return None

    # Get endpoint path from file location
    relative = route_file.parent.relative_to(api_base)
    endpoint = '/api/' + str(relative).replace('\\', '/').replace('[', ':').replace(']', '')

    # Find HTTP methods defined
    methods = []
    for method in ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']:
        if re.search(rf'\bexport\s+(async\s+)?function\s+{method}\b', content):
            methods.append(method)

    # Try to extract description from comments
    description = ''
    doc_match = re.search(r'/\*\*\s*\n\s*\*\s*(.+?)\n', content)
    if doc_match:
        description = doc_match.group(1).strip()

    # Extract parameters from dynamic route segments
    params = re.findall(r'\[([^\]]+)\]', str(relative))

    return {
        'endpoint': endpoint,
        'methods': methods,
        'params': params,
        'file': str(route_file),
        'description': description,
    }


def scan_server_actions(app_path: Path) -> List[Dict]:
    """Scan for Server Actions (use server directive)."""
    actions = []

    if not app_path.exists():
        return actions

    # Look for files with 'use server'
    for ts_file in app_path.rglob('*.ts'):
        file_actions = extract_server_actions(ts_file)
        actions.extend(file_actions)

    for tsx_file in app_path.rglob('*.tsx'):
        file_actions = extract_server_actions(tsx_file)
        actions.extend(file_actions)

    return actions


def extract_server_actions(file_path: Path) -> List[Dict]:
    """Extract server actions from a file."""
    actions = []

    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception:
        return actions

    # Check if file has 'use server' directive
    if "'use server'" not in content and '"use server"' not in content:
        return actions

    # Extract async function definitions
    pattern = r'export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)'
    matches = re.finditer(pattern, content)

    for match in matches:
        func_name = match.group(1)
        params = match.group(2).strip()

        # Try to find JSDoc description
        description = ''
        doc_pattern = rf'/\*\*[^*]*\*/\s*export\s+async\s+function\s+{func_name}'
        doc_match = re.search(doc_pattern, content, re.DOTALL)
        if doc_match:
            doc_text = doc_match.group(0)
            desc_match = re.search(r'\*\s+([^@*\n]+)', doc_text)
            if desc_match:
                description = desc_match.group(1).strip()

        actions.append({
            'name': func_name,
            'params': params if params else 'none',
            'file': str(file_path),
            'description': description,
        })

    return actions


def scan_services(services_path: Path) -> List[Dict]:
    """Scan service layer functions."""
    services = []

    if not services_path.exists():
        return services

    for service_file in services_path.rglob('*.ts'):
        if service_file.name.startswith('_'):
            continue

        service_info = extract_service_info(service_file)
        if service_info:
            services.append(service_info)

    return services


def extract_service_info(file_path: Path) -> Optional[Dict]:
    """Extract service information from a file."""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception:
        return None

    # Extract exported functions
    functions = []
    pattern = r'export\s+(?:async\s+)?(?:function|const)\s+(\w+)'
    matches = re.finditer(pattern, content)

    for match in matches:
        func_name = match.group(1)
        # Skip internal/utility functions
        if not func_name.startswith('_'):
            functions.append(func_name)

    if not functions:
        return None

    return {
        'name': file_path.stem,
        'file': str(file_path),
        'functions': functions,
        'function_count': len(functions),
    }


def scan_types(types_path: Path) -> List[Dict]:
    """Scan TypeScript type definitions."""
    types = []

    search_paths = [types_path]

    for search_path in search_paths:
        if not search_path.exists():
            continue

        for type_file in search_path.rglob('*.ts'):
            if type_file.suffix == '.d.ts' or 'types' in type_file.name.lower():
                type_info = extract_type_info(type_file)
                if type_info:
                    types.append(type_info)

    return types


def extract_type_info(file_path: Path) -> Optional[Dict]:
    """Extract type/interface definitions from a file."""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception:
        return None

    interfaces = []
    types_list = []

    # Find interfaces
    interface_pattern = r'export\s+interface\s+(\w+)'
    for match in re.finditer(interface_pattern, content):
        interfaces.append(match.group(1))

    # Find type aliases
    type_pattern = r'export\s+type\s+(\w+)'
    for match in re.finditer(type_pattern, content):
        types_list.append(match.group(1))

    if not interfaces and not types_list:
        return None

    return {
        'name': file_path.stem,
        'file': str(file_path),
        'interfaces': interfaces,
        'types': types_list,
        'total': len(interfaces) + len(types_list),
    }


def scan_project_apis(project_path: str = '.') -> Dict:
    """Main function to scan all API-related code."""
    root = get_project_root(project_path)
    src = root / 'src'

    # Determine paths
    app = src / 'app' if (src / 'app').exists() else root / 'app'
    api = app / 'api' if app.exists() else root / 'api'
    services = src / 'services' if (src / 'services').exists() else root / 'services'
    types_dir = src / 'types' if (src / 'types').exists() else root / 'types'

    result = {
        'scanned_at': datetime.now().isoformat(),
        'project_root': str(root),
        'api_routes': scan_api_routes(api),
        'server_actions': scan_server_actions(app),
        'services': scan_services(services),
        'types': scan_types(types_dir),
        'summary': {
            'total_routes': 0,
            'total_actions': 0,
            'total_services': 0,
            'total_types': 0,
        }
    }

    # Calculate summary
    result['summary']['total_routes'] = len(result['api_routes'])
    result['summary']['total_actions'] = len(result['server_actions'])
    result['summary']['total_services'] = len(result['services'])
    result['summary']['total_types'] = len(result['types'])

    return result


def main():
    """CLI entry point."""
    import sys

    project_path = sys.argv[1] if len(sys.argv) > 1 else '.'
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    result = scan_project_apis(project_path)

    output = json.dumps(result, indent=2)

    if output_file:
        Path(output_file).write_text(output, encoding='utf-8')
        print(f"API scan saved to: {output_file}")
    else:
        print(output)


if __name__ == '__main__':
    main()
