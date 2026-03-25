# Technical Term Glossary for Non-Coders

Use this reference to translate technical jargon in Claude Code release notes to plain English.

## Core Concepts

| Technical Term | Plain English | Example Context |
|----------------|---------------|-----------------|
| **MCP (Model Context Protocol)** | External tools Claude can use (like memory, browser, etc.) | "MCP servers" = the tools Claude connects to |
| **Context window** | Claude's "working memory" for the current conversation | "Context usage 40%" = Claude remembers 40% of its capacity |
| **Subagent** | A helper Claude working in the background | "Subagent completed" = background task finished |
| **Token** | A word or word-piece Claude processes | "1000 tokens" ≈ 750 words |
| **Spawn** | Create/start something | "Spawn parameter" = setting when creating a task |

## Interface Terms

| Technical Term | Plain English | Example Context |
|----------------|---------------|-----------------|
| **IME (Input Method Editor)** | Tool for typing in Chinese, Japanese, Korean | "IME support" = better Asian language typing |
| **CJK** | Chinese, Japanese, Korean languages | "CJK text" = Asian language text |
| **Status line** | The info bar at the bottom of Claude Code | Shows model, context usage, etc. |
| **Diff view** | Side-by-side comparison of changes | Shows what was changed in files |
| **Prompt suggestions** | Auto-complete hints as you type | Like Google search suggestions |

## Configuration Terms

| Technical Term | Plain English | Example Context |
|----------------|---------------|-----------------|
| **Wildcard** | Pattern matching symbol (* means "anything") | `mcp__*` = all MCP tools |
| **Permissions** | What Claude can do automatically | "Granted permission" = Claude can do this without asking |
| **Hooks** | Automatic actions triggered by events | "Pre-commit hook" = runs before saving changes |
| **Settings/Config** | Your preferences and setup | "Config file" = your settings file |
| **CLAUDE.md** | Your instructions file for Claude | Rules and preferences for Claude to follow |

## Technical Operations

| Technical Term | Plain English | Example Context |
|----------------|---------------|-----------------|
| **CLI (Command Line Interface)** | Text-based way to control software | Claude Code itself is a CLI |
| **Flag** | An option you add to a command | `-p` is a flag meaning "use pipe" |
| **Pipeline/Pipe** | Sending output from one command to another | "Piped input" = data coming from another program |
| **Non-interactive mode** | Running without human interaction | Automated scripts use this |
| **Steering messages** | Instructions that guide Claude's behavior | System prompts and rules |

## Development Terms (Usually Not Relevant to Non-Coders)

| Technical Term | Plain English | When It Matters to You |
|----------------|---------------|----------------------|
| **API** | Way for programs to talk to each other | Rarely - unless building integrations |
| **Endpoint** | A specific URL/address for an API | Rarely - unless configuring services |
| **SDK** | Tools for building software | Never - for developers only |
| **Runtime** | When software is actually running | Never - internal detail |
| **Parser** | Code that reads and interprets text | Never - internal detail |

## Platform Terms

| Technical Term | Plain English | Your Platform |
|----------------|---------------|---------------|
| **macOS** | Apple computers | ✅ You use this |
| **Windows** | Microsoft computers | ❌ Not your system |
| **Linux** | Open-source operating system | ❌ Not your system |
| **Darwin** | macOS's internal name | Same as macOS |

## Common Phrases Decoded

| Technical Phrase | What It Actually Means |
|------------------|----------------------|
| "Fixed a bug where..." | Something that was broken now works |
| "Added support for..." | New capability added |
| "Improved performance of..." | Made something faster/smoother |
| "Breaking change" | Something changed that might require you to update |
| "Deprecated" | Old way still works but will be removed later |
| "Edge case" | Unusual situation that caused problems |
| "Race condition" | Two things happened at the same time and conflicted |
| "Memory leak" | Software slowly uses more memory over time |

## Relevance Filters

### Always Relevant to You
- Memory/context improvements
- Permission changes
- CLAUDE.md-related updates
- macOS-specific fixes
- MCP tool updates (memory, browser, context7)

### Usually Not Relevant to You
- Windows-specific fixes
- Linux-specific fixes
- CJK/IME updates (if you type in English)
- API/SDK changes
- Developer tooling updates
- Non-interactive mode changes

### Check Your Setup
- Specific MCP server mentions (do you use that server?)
- Specific skill mentions (do you use that skill?)
- Plan mode changes (do you use plan mode?)
- Subagent changes (do you use background tasks?)
