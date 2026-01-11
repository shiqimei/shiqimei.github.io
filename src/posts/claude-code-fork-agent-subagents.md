---
title: "Claude Code's Fork and Agent Arguments: Running Skills in Sub-Agents"
date: 2026-01-11
excerpt: The context fork and agent arguments let skills run in isolated sub-agents, keeping intermediate steps out of the main conversation's context window.
---

<div class="lang-en">

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

</div>

<div class="lang-zh">

在[上一篇文章](/posts/agent-skill-vs-mcp-context-efficiency.html)中，我讨论了 Agent Skills 如何通过渐进式披露和脚本执行实现上下文效率。但我指出了一个局限性：不支持嵌套技能。复杂工作流无法委托给子技能而不污染主上下文。

Claude Code 现在通过两个新的技能参数解决了这个问题：`context: fork` 和 `agent: <type>`。

## 问题：技能执行污染上下文

当技能运行时，所有中间工作都发生在主对话上下文中：

- 每个 `Read` 工具调用及其输出
- 每个 `Grep` 搜索结果
- 每个 `Bash` 命令输出
- 步骤之间的所有推理

一个探索代码库来回答问题的技能可能会进行 20+ 次工具调用。每一次都消耗 tokens。到技能返回答案时，你已经烧掉了本可用于实际工作的上下文。

脚本执行对确定性操作有帮助。但对于需要全程 LLM 推理的技能呢——探索代码、做决策、适应发现的内容？

## 解决方案：Fork 上下文

`context: fork` 参数在隔离的子智能体中运行技能：

```yaml
---
name: analyze-codebase
description: Analyze codebase architecture and patterns
context: fork
---
```

当此技能触发时：

1. Claude 生成一个具有全新上下文的子智能体
2. 子智能体只接收技能指令和用户查询
3. 子智能体独立执行——读取文件、搜索代码、推理
4. 只有最终结果返回到主对话

所有中间工具调用、文件内容和推理都保留在子智能体的上下文中。主对话只看到答案。

## 选择正确的智能体类型

`agent: <type>` 参数指定哪种专门的智能体运行技能：

```yaml
---
name: explore-architecture
description: Map out the codebase structure and dependencies
context: fork
agent: Explore
---
```

可用的智能体类型：

| 智能体 | 能力 | 用例 |
|-------|------|-----|
| `general-purpose` | 所有工具，完整推理 | 复杂多步任务 |
| `Explore` | 快速文件搜索，模式匹配 | 代码库探索 |
| `Plan` | 架构分析，步骤规划 | 实现规划 |
| `Bash` | 仅命令执行 | shell 密集型操作 |

将智能体类型与技能需求匹配。探索技能受益于 `Explore` 智能体的优化搜索。部署技能可能使用 `Bash` 进行专注的命令执行。

## 实际示例

考虑一个回答架构问题的技能：

**不使用 fork：**

```
用户："这个代码库中的认证是如何工作的？"

[技能触发]
[Read auth/middleware.ts - 200 行进入上下文]
[Grep "jwt" - 15 个匹配进入上下文]
[Read auth/providers/oauth.ts - 150 行进入上下文]
[Read auth/session.ts - 100 行进入上下文]
[关于认证流程的推理...]

答案："认证使用带 OAuth 提供者的 JWT tokens..."
```

消耗的总上下文：约 500+ 行代码、搜索结果、推理。

**使用 fork：**

```
用户："这个代码库中的认证是如何工作的？"

[技能触发，带 context: fork]
[子智能体生成，独立探索]

答案："认证使用带 OAuth 提供者的 JWT tokens..."
```

主对话消耗的总上下文：只有答案。

子智能体做了同样的工作，但是隔离的。主对话保持干净。

## 何时使用 Fork

当你的技能满足以下条件时使用 `context: fork`：

- 读取多个文件来综合答案
- 执行结果不确定的探索性搜索
- 需要生成中间产物的多步推理
- 如果内联运行会消耗大量上下文

不使用 fork 的情况：

- 技能很简单（单个文件读取，一个命令）
- 你需要技能的中间结果在主对话中
- 生成子智能体的开销超过上下文节省

## 完整图景

这完成了技能效率的故事：

1. **渐进式披露**：启动时只加载 frontmatter（每个技能约 20 tokens）
2. **按需加载**：完整技能内容只在触发时加载
3. **脚本执行**：确定性操作在上下文外运行
4. **上下文 fork**：LLM 驱动的操作在隔离的子智能体中运行

每一层都减少上下文消耗。它们一起使技能比传统工具架构效率高得多。

## 配置

将这些参数添加到你的技能 frontmatter：

```yaml
---
name: my-skill
description: What this skill does
context: fork          # 在隔离的子智能体中运行
agent: Explore         # 使用 Explore 智能体类型
---
```

两个参数都是可选的。根据技能需求一起或分开使用。

## 结论

`context: fork` 和 `agent: <type>` 参数解决了嵌套技能问题。复杂技能现在可以运行复杂的多步操作而不消耗主对话上下文。

模式很简单：隔离昂贵的操作，只返回结果。上下文是瓶颈——这些工具帮助你尊重它。

</div>
