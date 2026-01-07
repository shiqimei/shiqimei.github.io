---
title: "Why Agent Skills Beat MCP for Context Efficiency"
date: 2026-01-07
excerpt: Agent Skills use progressive disclosure and script execution to dramatically reduce context consumption compared to MCP's upfront tool loading approach.
---

MCP (Model Context Protocol) has become the standard way to extend LLM agents with external tools. But there's an alternative architecture that's significantly more context-efficient: Agent Skills.

This post breaks down why Agent Skills consume far less context than MCP, and why that matters for building capable agents.

## The Context Budget Problem

Every LLM has a finite context window. Even with 128K or 200K token models, context is a scarce resource. Tool definitions, conversation history, and working memory all compete for the same space.

MCP's approach: load all tool definitions upfront. Each tool's JSON Schema - parameters, types, descriptions, examples - gets injected into every request.

A typical MCP tool definition runs 5,000 to 6,000 tokens. Load 10 tools and you've consumed 50K tokens before the agent does anything useful. That's nearly half of a 128K context window, gone to tool definitions alone.

## Progressive Disclosure: Load What You Need

Agent Skills take a different approach: progressive disclosure.

At startup, only the frontmatter of each skill gets loaded - just the name and a one-line description. A single skill's frontmatter is roughly 10-20 tokens.

```yaml
---
name: git-commit
description: Stage and commit changes with conventional commit messages
---
```

The math changes dramatically:

| Approach | 10 Tools | 100 Tools | 1000 Tools |
|----------|----------|-----------|------------|
| MCP | ~50K tokens | ~500K tokens | Not feasible |
| Skills (frontmatter only) | ~150 tokens | ~1.5K tokens | ~15K tokens |

With Skills, you can have thousands of capabilities available while only consuming 15K tokens. The full skill content - documentation, examples, implementation details - only loads when the agent decides to use that specific skill.

This is progressive disclosure: show the menu first, load the recipe only when cooking.

## Script Execution: Keep Intermediate Steps Out of Context

The second efficiency gain comes from how Skills execute.

Many agent operations are idempotent - they produce the same result every time. Reading a config file. Checking directory structure. Installing dependencies. Running a build.

MCP treats each tool call as a context event. Every input, every output, every intermediate step gets recorded in the conversation history. A 20-step task means 20 tool calls polluting your context.

Agent Skills can encapsulate stable operations into bash scripts. The script runs outside the context window. Only the final result returns to the model.

```bash
# This entire script executes without touching context
#!/bin/bash
npm install
npm run lint
npm run test
npm run build

# Only this summary enters context
echo "Build completed: 0 errors, 0 warnings"
```

For complex workflows, this difference compounds. A deployment pipeline might have 50 steps internally but only report "Deployment successful" back to the model.

## Unix: The Native Language of LLMs

There's a deeper reason why Skills work well: they're built on bash and the filesystem.

Unix has existed since the 1970s. The internet is saturated with shell scripts, command-line tutorials, man pages, and pipeline examples. All of this was consumed during LLM pretraining.

LLMs don't need to learn a new protocol to use Skills. They already understand:

- File paths and directory navigation
- Piping and redirection
- Common utilities (grep, sed, awk, curl)
- Environment variables and shell expansion

MCP requires models to learn a custom protocol - specific JSON structures, particular calling conventions, tool-specific quirks. Skills leverage knowledge the model already has baked into its weights.

This isn't just about familiarity. It's about error rates. Models make fewer mistakes with patterns they've seen millions of times during training.

## When MCP Still Makes Sense

MCP has legitimate use cases:

- **Stateful connections**: Database sessions, WebSocket connections, authenticated API clients
- **Binary protocols**: Services that can't be accessed via shell commands
- **Strict typing**: When you need runtime validation of complex parameter structures
- **Cross-platform**: When bash isn't available or reliable

But for the common case - file operations, API calls, build tools, git workflows - Skills offer better context economics.

## The Practical Impact

Context efficiency isn't abstract. It directly affects what agents can accomplish:

- **Longer conversations**: More context for actual work, less for tool overhead
- **More tools available**: Thousands of skills vs. dozens of MCP tools
- **Better reasoning**: More space for chain-of-thought and working memory
- **Lower costs**: Fewer tokens means lower API bills

The constraint isn't capability - it's context. Architectures that respect this constraint scale better.

## Conclusion

Agent Skills beat MCP on context efficiency through two mechanisms:

1. **Progressive disclosure**: Load frontmatter at startup (~20 tokens per skill), full content on-demand
2. **Script execution**: Intermediate steps stay outside context, only results return

Combined with LLMs' native understanding of Unix patterns, Skills offer a more scalable foundation for building capable agents.

Context is the bottleneck. Spend it wisely.
