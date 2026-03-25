#!/usr/bin/env python3
"""
Changes Scanner - Analyzes git history for README changelog generation.

Scans:
- Recent commits
- Modified files
- New features (based on commit messages)
- Contributors
"""

import subprocess
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime, timedelta


def run_git_command(cmd: List[str], cwd: str = '.') -> Optional[str]:
    """Run a git command and return output."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception:
        return None


def get_project_root(start_path: str = '.') -> Path:
    """Find git root directory."""
    result = run_git_command(['git', 'rev-parse', '--show-toplevel'], start_path)
    if result:
        return Path(result)
    return Path(start_path).resolve()


def get_recent_commits(root: str, limit: int = 20) -> List[Dict]:
    """Get recent commits with details."""
    commits = []

    # Format: hash|author|date|subject
    format_str = '%H|%an|%ai|%s'
    output = run_git_command(
        ['git', 'log', f'-{limit}', f'--format={format_str}'],
        root
    )

    if not output:
        return commits

    for line in output.strip().split('\n'):
        if not line:
            continue

        parts = line.split('|', 3)
        if len(parts) >= 4:
            commit_hash, author, date, subject = parts
            commits.append({
                'hash': commit_hash[:7],
                'full_hash': commit_hash,
                'author': author,
                'date': date.split()[0],  # Just the date part
                'message': subject,
                'type': categorize_commit(subject),
            })

    return commits


def categorize_commit(message: str) -> str:
    """Categorize commit based on conventional commit format or keywords."""
    message_lower = message.lower()

    # Conventional commits
    if message_lower.startswith('feat'):
        return 'feature'
    elif message_lower.startswith('fix'):
        return 'bugfix'
    elif message_lower.startswith('docs'):
        return 'documentation'
    elif message_lower.startswith('style'):
        return 'style'
    elif message_lower.startswith('refactor'):
        return 'refactor'
    elif message_lower.startswith('test'):
        return 'test'
    elif message_lower.startswith('chore'):
        return 'chore'

    # Keyword-based
    if any(kw in message_lower for kw in ['add', 'new', 'create', 'implement']):
        return 'feature'
    elif any(kw in message_lower for kw in ['fix', 'bug', 'resolve', 'patch']):
        return 'bugfix'
    elif any(kw in message_lower for kw in ['update', 'upgrade', 'bump']):
        return 'update'
    elif any(kw in message_lower for kw in ['remove', 'delete', 'deprecate']):
        return 'removal'
    elif any(kw in message_lower for kw in ['refactor', 'restructure', 'reorganize']):
        return 'refactor'

    return 'other'


def get_modified_files(root: str, since_days: int = 7) -> List[Dict]:
    """Get files modified in the last N days."""
    modified = []

    since_date = (datetime.now() - timedelta(days=since_days)).strftime('%Y-%m-%d')
    output = run_git_command(
        ['git', 'log', f'--since={since_date}', '--name-status', '--format='],
        root
    )

    if not output:
        return modified

    file_changes = {}
    for line in output.strip().split('\n'):
        if not line:
            continue

        parts = line.split('\t')
        if len(parts) >= 2:
            status, filepath = parts[0], parts[-1]

            if filepath not in file_changes:
                file_changes[filepath] = {
                    'path': filepath,
                    'changes': 0,
                    'status': [],
                }

            file_changes[filepath]['changes'] += 1
            if status not in file_changes[filepath]['status']:
                file_changes[filepath]['status'].append(status)

    # Convert to list and sort by changes
    modified = list(file_changes.values())
    modified.sort(key=lambda x: x['changes'], reverse=True)

    return modified[:30]  # Limit to top 30


def get_contributors(root: str) -> List[Dict]:
    """Get list of contributors."""
    contributors = []

    output = run_git_command(
        ['git', 'shortlog', '-sne', '--all'],
        root
    )

    if not output:
        return contributors

    for line in output.strip().split('\n'):
        if not line:
            continue

        # Format: "   123\tName <email>"
        match = re.match(r'\s*(\d+)\t(.+?)\s*<(.+?)>', line)
        if match:
            commits, name, email = match.groups()
            contributors.append({
                'name': name,
                'email': email,
                'commits': int(commits),
            })

    return contributors


def get_branch_info(root: str) -> Dict:
    """Get current branch information."""
    current_branch = run_git_command(['git', 'branch', '--show-current'], root)
    default_branch = run_git_command(
        ['git', 'symbolic-ref', 'refs/remotes/origin/HEAD', '--short'],
        root
    )

    # Get commit count
    commit_count = run_git_command(['git', 'rev-list', '--count', 'HEAD'], root)

    # Get last tag
    last_tag = run_git_command(['git', 'describe', '--tags', '--abbrev=0'], root)

    return {
        'current': current_branch or 'unknown',
        'default': default_branch.replace('origin/', '') if default_branch else 'main',
        'total_commits': int(commit_count) if commit_count else 0,
        'last_tag': last_tag or 'none',
    }


def extract_features_from_commits(commits: List[Dict]) -> List[Dict]:
    """Extract notable features from recent commits."""
    features = []

    for commit in commits:
        if commit['type'] == 'feature':
            # Clean up the message
            message = commit['message']
            # Remove conventional commit prefix
            message = re.sub(r'^feat(\([^)]+\))?:\s*', '', message, flags=re.IGNORECASE)

            features.append({
                'description': message,
                'date': commit['date'],
                'hash': commit['hash'],
            })

    return features


def generate_changelog_entries(commits: List[Dict]) -> List[Dict]:
    """Generate changelog-style entries grouped by date."""
    entries = {}

    for commit in commits:
        date = commit['date']
        if date not in entries:
            entries[date] = {
                'date': date,
                'features': [],
                'fixes': [],
                'other': [],
            }

        message = commit['message']
        # Clean conventional commit prefix
        message = re.sub(r'^(feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?:\s*', '', message, flags=re.IGNORECASE)

        if commit['type'] == 'feature':
            entries[date]['features'].append(message)
        elif commit['type'] == 'bugfix':
            entries[date]['fixes'].append(message)
        else:
            entries[date]['other'].append(message)

    # Convert to list sorted by date
    result = list(entries.values())
    result.sort(key=lambda x: x['date'], reverse=True)

    return result[:10]  # Last 10 days with activity


def scan_project_changes(project_path: str = '.', days: int = 30) -> Dict:
    """Main function to scan project git history."""
    root = str(get_project_root(project_path))

    # Check if git repo
    is_git = run_git_command(['git', 'status'], root) is not None

    if not is_git:
        return {
            'scanned_at': datetime.now().isoformat(),
            'error': 'Not a git repository',
        }

    commits = get_recent_commits(root, limit=50)

    result = {
        'scanned_at': datetime.now().isoformat(),
        'project_root': root,
        'branch': get_branch_info(root),
        'recent_commits': commits[:20],
        'modified_files': get_modified_files(root, since_days=days),
        'contributors': get_contributors(root),
        'features': extract_features_from_commits(commits),
        'changelog': generate_changelog_entries(commits),
        'summary': {
            'total_commits_scanned': len(commits),
            'features_added': len([c for c in commits if c['type'] == 'feature']),
            'bugs_fixed': len([c for c in commits if c['type'] == 'bugfix']),
            'contributors_count': 0,
        }
    }

    result['summary']['contributors_count'] = len(result['contributors'])

    return result


def main():
    """CLI entry point."""
    import sys

    project_path = sys.argv[1] if len(sys.argv) > 1 else '.'
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    result = scan_project_changes(project_path)

    output = json.dumps(result, indent=2)

    if output_file:
        Path(output_file).write_text(output, encoding='utf-8')
        print(f"Changes scan saved to: {output_file}")
    else:
        print(output)


if __name__ == '__main__':
    main()
