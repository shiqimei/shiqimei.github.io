---
title: "Claude Code's Fork and Agent Arguments: Running Skills in Sub-Agents"
date: 2026-01-11
excerpt: The context fork and agent arguments let skills run in isolated sub-agents, keeping intermediate steps out of the main conversation's context window.
---

In a [previous post](/posts/agent-skill-vs-mcp-context-efficiency.html), I discussed how Agent Skills achieve context efficiency through progressive disclosure and script execution. But I noted a limitation: no nested skill support. Complex workflows couldn't delegate to sub-skills without polluting the main context.

Claude Code now addresses this with two new skill arguments: `context: fork` and `agent: <type>`.

## The Problem: Skill Execution Pollutes Context

When a skill runs, all its intermediate work happens in the main conversation context:

- Every `Read` tool call and its output
- Every `Grep` search result
- Every `Bash` command output
- All the reasoning between steps

A skill that explores a codebase to answer a question might make 20+ tool calls. Each one consumes tokens. By the time the skill returns its answer, you've burned through context that could have been used for actual work.

Script execution helps for deterministic operations. But what about skills that require LLM reasoning throughout - exploring code, making decisions, adapting to what they find?

## The Solution: Fork the Context

The `context: fork` argument runs a skill in an isolated sub-agent:

```yaml
---
name: analyze-codebase
description: Analyze codebase architecture and patterns
context: fork
---
```

When this skill triggers:

1. Claude spawns a sub-agent with fresh context
2. The sub-agent receives only the skill instructions and user query
3. The sub-agent executes independently - reads files, searches code, reasons
4. Only the final result returns to the main conversation

All intermediate tool calls, file contents, and reasoning stay in the sub-agent's context. The main conversation sees just the answer.

## Choosing the Right Agent Type

The `agent: <type>` argument specifies which specialized agent runs the skill:

```yaml
---
name: explore-architecture
description: Map out the codebase structure and dependencies
context: fork
agent: Explore
---
```

Available agent types:

| Agent | Capabilities | Use Case |
|-------|--------------|----------|
| `general-purpose` | All tools, full reasoning | Complex multi-step tasks |
| `Explore` | Fast file search, pattern matching | Codebase exploration |
| `Plan` | Architecture analysis, step planning | Implementation planning |
| `Bash` | Command execution only | Shell-heavy operations |

Match the agent type to what the skill needs. An exploration skill benefits from the `Explore` agent's optimized search. A deployment skill might use `Bash` for focused command execution.

## Practical Example

Consider a skill that answers architecture questions:

**Without fork:**

```
User: "How does authentication work in this codebase?"

[Skill triggers]
[Read auth/middleware.ts - 200 lines in context]
[Grep for "jwt" - 15 matches in context]
[Read auth/providers/oauth.ts - 150 lines in context]
[Read auth/session.ts - 100 lines in context]
[Reasoning about the auth flow...]

Answer: "Authentication uses JWT tokens with OAuth providers..."
```

Total context consumed: ~500+ lines of code, search results, reasoning.

**With fork:**

```
User: "How does authentication work in this codebase?"

[Skill triggers with context: fork]
[Sub-agent spawns, explores independently]

Answer: "Authentication uses JWT tokens with OAuth providers..."
```

Total context consumed in main conversation: just the answer.

The sub-agent did the same work, but in isolation. The main conversation stays clean.

## When to Use Fork

Use `context: fork` when your skill:

- Reads multiple files to synthesize an answer
- Performs exploratory searches with uncertain outcomes
- Requires multi-step reasoning that generates intermediate artifacts
- Could consume significant context if run inline

Don't use fork when:

- The skill is simple (single file read, one command)
- You need the skill's intermediate results in the main conversation
- The overhead of spawning a sub-agent exceeds the context savings

## The Complete Picture

This completes the skill efficiency story:

1. **Progressive disclosure**: Only frontmatter loads at startup (~20 tokens per skill)
2. **On-demand loading**: Full skill content loads only when triggered
3. **Script execution**: Deterministic operations run outside context
4. **Context fork**: LLM-driven operations run in isolated sub-agents

Each layer reduces context consumption. Together, they make skills dramatically more efficient than traditional tool architectures.

## Configuration

Add these arguments to your skill's frontmatter:

```yaml
---
name: my-skill
description: What this skill does
context: fork          # Run in isolated sub-agent
agent: Explore         # Use the Explore agent type
---
```

Both arguments are optional. Use them together or separately based on your skill's needs.

## Conclusion

The `context: fork` and `agent: <type>` arguments solve the nested skill problem. Complex skills can now run sophisticated, multi-step operations without consuming main conversation context.

The pattern is simple: isolate expensive operations, return only results. Context is the bottleneck - these tools help you respect it.
