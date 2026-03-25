#!/usr/bin/env python3
"""
Main Scanner Runner - Orchestrates all scanners and generates metadata JSON.

Usage:
    python run_scanners.py [project_path] [--output metadata.json]

This script runs all scanners and combines their output into a single
metadata JSON file that can be used by Claude to update the README.
"""

import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

# Import scanners
from scan_structure import scan_project_structure
from scan_apis import scan_project_apis
from scan_dependencies import scan_project_dependencies
from scan_changes import scan_project_changes


def merge_metadata(structure: dict, apis: dict, deps: dict, changes: dict) -> dict:
    """Merge all scanner outputs into a single metadata object."""

    # Extract project name from various sources
    project_name = (
        deps.get('metadata', {}).get('name') or
        Path(structure.get('project_root', '.')).name or
        'Project'
    )

    return {
        'generated_at': datetime.now().isoformat(),
        'project': {
            'name': project_name,
            'version': deps.get('metadata', {}).get('version', '0.0.0'),
            'description': deps.get('metadata', {}).get('description', ''),
            'root': structure.get('project_root', '.'),
        },
        'structure': structure.get('structure', {}),
        'modules': structure.get('modules', []),
        'components': structure.get('components', {}),
        'apis': {
            'routes': apis.get('api_routes', []),
            'server_actions': apis.get('server_actions', []),
            'services': apis.get('services', []),
            'types': apis.get('types', []),
        },
        'tech_stack': deps.get('tech_stack', []),
        'scripts': deps.get('scripts', []),
        'dependencies': deps.get('dependencies', {}),
        'changes': {
            'branch': changes.get('branch', {}),
            'recent_commits': changes.get('recent_commits', [])[:10],
            'modified_files': changes.get('modified_files', [])[:20],
            'features': changes.get('features', []),
            'changelog': changes.get('changelog', [])[:5],
        },
        'summary': {
            'modules': {
                'total': structure.get('summary', {}).get('total_modules', 0),
                'complete': structure.get('summary', {}).get('complete_modules', 0),
                'in_progress': structure.get('summary', {}).get('in_progress_modules', 0),
            },
            'components': structure.get('summary', {}).get('total_components', 0),
            'api_routes': apis.get('summary', {}).get('total_routes', 0),
            'server_actions': apis.get('summary', {}).get('total_actions', 0),
            'services': apis.get('summary', {}).get('total_services', 0),
            'types': apis.get('summary', {}).get('total_types', 0),
            'dependencies': deps.get('summary', {}).get('total_dependencies', 0),
            'dev_dependencies': deps.get('summary', {}).get('total_dev_dependencies', 0),
            'recent_features': changes.get('summary', {}).get('features_added', 0),
            'recent_fixes': changes.get('summary', {}).get('bugs_fixed', 0),
        }
    }


def run_all_scanners(project_path: str = '.') -> dict:
    """Run all scanners and return merged metadata."""
    print("🔍 Running project scanners...")

    print("  📁 Scanning structure...")
    structure = scan_project_structure(project_path)

    print("  🔌 Scanning APIs...")
    apis = scan_project_apis(project_path)

    print("  📦 Scanning dependencies...")
    deps = scan_project_dependencies(project_path)

    print("  📝 Scanning changes...")
    changes = scan_project_changes(project_path)

    print("  🔄 Merging metadata...")
    metadata = merge_metadata(structure, apis, deps, changes)

    return metadata


def print_summary(metadata: dict):
    """Print a summary of what was found."""
    summary = metadata.get('summary', {})
    project = metadata.get('project', {})

    print("\n" + "=" * 50)
    print(f"📊 SCAN SUMMARY: {project.get('name', 'Project')}")
    print("=" * 50)

    modules = summary.get('modules', {})
    print(f"\n📁 Modules:")
    print(f"   Total: {modules.get('total', 0)}")
    print(f"   Complete: {modules.get('complete', 0)} ✅")
    print(f"   In Progress: {modules.get('in_progress', 0)} 🔄")

    print(f"\n🧩 Components: {summary.get('components', 0)}")

    print(f"\n🔌 APIs:")
    print(f"   Routes: {summary.get('api_routes', 0)}")
    print(f"   Server Actions: {summary.get('server_actions', 0)}")
    print(f"   Services: {summary.get('services', 0)}")
    print(f"   Types: {summary.get('types', 0)}")

    print(f"\n📦 Dependencies:")
    print(f"   Production: {summary.get('dependencies', 0)}")
    print(f"   Development: {summary.get('dev_dependencies', 0)}")

    print(f"\n📝 Recent Changes:")
    print(f"   Features Added: {summary.get('recent_features', 0)}")
    print(f"   Bugs Fixed: {summary.get('recent_fixes', 0)}")

    print("\n" + "=" * 50)


def main():
    parser = argparse.ArgumentParser(
        description='Run all project scanners and generate metadata for README updates'
    )
    parser.add_argument(
        'project_path',
        nargs='?',
        default='.',
        help='Path to the project root (default: current directory)'
    )
    parser.add_argument(
        '--output', '-o',
        default='readme-metadata.json',
        help='Output file for metadata JSON (default: readme-metadata.json)'
    )
    parser.add_argument(
        '--quiet', '-q',
        action='store_true',
        help='Suppress summary output'
    )

    args = parser.parse_args()

    # Run all scanners
    metadata = run_all_scanners(args.project_path)

    # Save to file
    output_path = Path(args.output)
    output_path.write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    print(f"\n✅ Metadata saved to: {output_path}")

    # Print summary unless quiet
    if not args.quiet:
        print_summary(metadata)

    return 0


if __name__ == '__main__':
    sys.exit(main())
