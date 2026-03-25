# README Template Reference

This reference defines the standard README structure for JKKN projects. Claude uses this
template when generating or updating README files, adapting sections based on available metadata.

## Template Structure

```markdown
# {project_name}

> {project_description}

![Version](https://img.shields.io/badge/version-{version}-blue)
![Status](https://img.shields.io/badge/status-{status}-green)

## Overview

{AI-generated overview based on project analysis. Should describe:
- What the project does
- Key features
- Target users (using JKKN terminology: learners, learning facilitators, team members)}

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
{For each item in tech_stack:}
| {name} | {version} | {category} |

## Project Structure

```
{tree_string from structure scan}
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and layouts |
| `src/components/` | Reusable UI components |
| `src/services/` | Supabase service layer |
| `src/hooks/` | Custom React hooks |
| `src/types/` | TypeScript type definitions |

## Modules

| Module | Status | Description |
|--------|--------|-------------|
{For each module:}
| {name} | {status_icon} {status} | {description} |

### Module Progress

- **Complete:** {complete_count}/{total_count}
- **In Progress:** {in_progress_count}

## API Reference

### API Routes

| Endpoint | Methods | Description |
|----------|---------|-------------|
{For each api_route:}
| `{endpoint}` | {methods} | {description} |

### Server Actions

| Action | Parameters | Description |
|--------|------------|-------------|
{For each server_action:}
| `{name}()` | {params} | {description} |

### Services

| Service | Functions | Description |
|---------|-----------|-------------|
{For each service:}
| {name} | {function_count} functions | {functions list} |

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
{If has Supabase:}
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone {repo_url}

# Navigate to project
cd {project_name}

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

{If has database:}
# Set up database
npm run db:push
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
{For each script:}
| `{name}` | `npm run {name}` | {description or command} |

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
{For key production dependencies:}
| {name} | {version} | {description} |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
{For key dev dependencies:}
| {name} | {version} | {description} |

## Recent Changes

{For each changelog entry (last 5):}
### {date}

**Features:**
{For each feature:}
- {description}

**Fixes:**
{For each fix:}
- {description}

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## License

{license_type or "Private - All rights reserved"}

---

*This README is automatically maintained by the readme-auto-updater skill*
*Last updated: {generated_at}*
```

## Section Guidelines

### Required Sections
These sections should always be included:
- Project title and description
- Tech Stack
- Getting Started (Installation + Development)
- Available Scripts

### Conditional Sections
Include based on metadata availability:
- **Modules:** Only if modules detected in app router
- **API Reference:** Only if API routes or server actions exist
- **Recent Changes:** Only if git history available
- **Dependencies table:** Only if significant dependencies exist

### Optional Sections
Include if relevant:
- Contributing guidelines
- License information
- Environment variables reference

## JKKN Terminology Enforcement

When generating README content, ALWAYS use JKKN terminology:

| Context | NEVER Use | ALWAYS Use |
|---------|-----------|------------|
| Users | students, users | learners |
| Staff | teachers, admin | learning facilitators, team members |
| Spaces | classroom, room | learning studio |
| Content | syllabus, curriculum | learning pathway, learning framework |
| Results | grades, pass/fail | learning assessments, achieved/did not meet outcomes |

## Dynamic Content Generation

Claude should analyze the metadata and generate appropriate content:

1. **Overview:** Synthesize from project name, description, modules, and tech stack
2. **Module descriptions:** Infer from module name and contained files
3. **API descriptions:** Extract from code comments or infer from endpoint names
4. **Change summaries:** Consolidate related commits into meaningful updates

## Formatting Standards

- Use consistent heading hierarchy (# for title, ## for sections, ### for subsections)
- Use tables for structured data
- Use code blocks with syntax highlighting
- Keep line lengths reasonable (< 100 characters)
- Use relative links for internal references
- Include badges where appropriate
