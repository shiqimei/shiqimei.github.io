---
title: "Why Agent Skills Beat MCP for Context Efficiency"
date: 2026-01-07
excerpt: Agent Skills use progressive disclosure and script execution to dramatically reduce context consumption compared to MCP's upfront tool loading approach.
---

<div class="lang-en">

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

## Current Limitations

Agent Skills are promising, but the standard is still immature. Two significant gaps:

**1. Specification is too loose**

The current skill definition is essentially "a markdown file with frontmatter." There's no formal spec for:

- Parameter declarations and type constraints
- Input/output contracts
- Error handling conventions
- Dependency declarations between skills
- Versioning and compatibility

MCP, for all its verbosity, has a rigorous JSON Schema spec. Skills rely on the LLM to infer structure from natural language descriptions. This works surprisingly well in practice, but it's not a foundation for tooling, validation, or cross-agent interoperability.

**2. No nested skill support**

Complex workflows naturally decompose into sub-tasks. A "deploy-application" skill might internally need "run-tests", "build-artifacts", and "push-to-registry" as sub-skills.

Currently, there's no standard way to:

- Declare skill dependencies
- Invoke one skill from another
- Share context between parent and child skills
- Handle partial failures in skill chains

Each skill is a flat, isolated unit. Composition happens ad-hoc through bash scripts or manual orchestration.

## Outlook

The path forward is clear:

**Formal specification**: A minimal but precise schema for skill definitions. Parameter types, required vs optional fields, return value contracts. Enough structure for tooling without MCP's verbosity.

**Hierarchical skills**: First-class support for sub-skills. A skill should be able to declare dependencies on other skills, invoke them with proper context isolation, and handle their results programmatically.

**Skill registries**: Discoverability beyond local filesystems. Shared repositories of community skills with versioning, ratings, and compatibility metadata.

**Hybrid architectures**: Skills and MCP aren't mutually exclusive. Use Skills for the common case (context-efficient, Unix-native), fall back to MCP for stateful protocols and strict typing. Let the agent choose based on the task.

The efficiency advantages of Skills are real. The ecosystem just needs to mature.

## Conclusion

Agent Skills beat MCP on context efficiency through two mechanisms:

1. **Progressive disclosure**: Load frontmatter at startup (~20 tokens per skill), full content on-demand
2. **Script execution**: Intermediate steps stay outside context, only results return

Combined with LLMs' native understanding of Unix patterns, Skills offer a more scalable foundation for building capable agents.

Context is the bottleneck. Spend it wisely.

</div>

<div class="lang-zh">

MCP（Model Context Protocol）已成为用外部工具扩展 LLM 智能体的标准方式。但有一种替代架构在上下文效率上明显更高：Agent Skills。

本文分析了为什么 Agent Skills 比 MCP 消耗更少的上下文，以及这对构建强大智能体的重要性。

## 上下文预算问题

每个 LLM 都有有限的上下文窗口。即使是 128K 或 200K token 的模型，上下文也是稀缺资源。工具定义、对话历史和工作记忆都在竞争同一空间。

MCP 的方法：预先加载所有工具定义。每个工具的 JSON Schema——参数、类型、描述、示例——被注入到每个请求中。

一个典型的 MCP 工具定义约 5,000 到 6,000 tokens。加载 10 个工具，你在智能体做任何有用的事情之前就消耗了 50K tokens。这几乎是 128K 上下文窗口的一半，仅用于工具定义。

## 渐进式披露：按需加载

Agent Skills 采用不同的方法：渐进式披露。

启动时，只加载每个技能的 frontmatter——仅名称和一行描述。单个技能的 frontmatter 大约 10-20 tokens。

```yaml
---
name: git-commit
description: Stage and commit changes with conventional commit messages
---
```

数学计算发生了巨大变化：

| 方法 | 10 个工具 | 100 个工具 | 1000 个工具 |
|-----|---------|-----------|------------|
| MCP | ~50K tokens | ~500K tokens | 不可行 |
| Skills（仅 frontmatter） | ~150 tokens | ~1.5K tokens | ~15K tokens |

使用 Skills，你可以有数千个可用能力，同时只消耗 15K tokens。完整的技能内容——文档、示例、实现细节——只在智能体决定使用该特定技能时才加载。

这就是渐进式披露：先展示菜单，做菜时才加载食谱。

## 脚本执行：将中间步骤排除在上下文之外

第二个效率提升来自 Skills 的执行方式。

许多智能体操作是幂等的——每次产生相同的结果。读取配置文件。检查目录结构。安装依赖。运行构建。

MCP 将每个工具调用视为上下文事件。每个输入、每个输出、每个中间步骤都记录在对话历史中。一个 20 步任务意味着 20 个工具调用污染你的上下文。

Agent Skills 可以将稳定操作封装到 bash 脚本中。脚本在上下文窗口之外运行。只有最终结果返回给模型。

```bash
# 整个脚本执行不触及上下文
#!/bin/bash
npm install
npm run lint
npm run test
npm run build

# 只有这个摘要进入上下文
echo "Build completed: 0 errors, 0 warnings"
```

对于复杂工作流，这种差异会累积。一个部署流水线内部可能有 50 个步骤，但只向模型报告"部署成功"。

## Unix：LLM 的原生语言

Skills 工作良好有一个更深层的原因：它们建立在 bash 和文件系统之上。

Unix 自 1970 年代就存在。互联网上充满了 shell 脚本、命令行教程、man 页面和管道示例。所有这些都在 LLM 预训练期间被消费。

LLM 不需要学习新协议来使用 Skills。它们已经理解：

- 文件路径和目录导航
- 管道和重定向
- 常用工具（grep、sed、awk、curl）
- 环境变量和 shell 展开

MCP 要求模型学习自定义协议——特定的 JSON 结构、特定的调用约定、工具特定的怪癖。Skills 利用模型已经烘焙在权重中的知识。

这不仅仅是熟悉度的问题。这是关于错误率的。模型在训练期间见过数百万次的模式上犯更少的错误。

## MCP 仍然有意义的场景

MCP 有合理的用例：

- **有状态连接**：数据库会话、WebSocket 连接、已认证的 API 客户端
- **二进制协议**：无法通过 shell 命令访问的服务
- **严格类型**：当你需要复杂参数结构的运行时验证时
- **跨平台**：当 bash 不可用或不可靠时

但对于常见情况——文件操作、API 调用、构建工具、git 工作流——Skills 提供更好的上下文经济性。

## 实际影响

上下文效率不是抽象的。它直接影响智能体能完成什么：

- **更长的对话**：更多上下文用于实际工作，更少用于工具开销
- **更多可用工具**：数千个技能 vs 几十个 MCP 工具
- **更好的推理**：更多空间用于思维链和工作记忆
- **更低成本**：更少的 tokens 意味着更低的 API 账单

约束不是能力——是上下文。尊重这一约束的架构能更好地扩展。

## 当前局限性

Agent Skills 很有前途，但标准仍然不成熟。两个重要差距：

**1. 规范太松散**

当前的技能定义本质上是"带 frontmatter 的 markdown 文件"。没有正式规范用于：

- 参数声明和类型约束
- 输入/输出契约
- 错误处理约定
- 技能间的依赖声明
- 版本控制和兼容性

MCP 尽管冗长，但有严格的 JSON Schema 规范。Skills 依赖 LLM 从自然语言描述推断结构。这在实践中效果出奇地好，但它不是工具、验证或跨智能体互操作性的基础。

**2. 不支持嵌套技能**

复杂工作流自然分解为子任务。一个"部署应用"技能内部可能需要"运行测试"、"构建产物"和"推送到注册表"作为子技能。

目前，没有标准方式来：

- 声明技能依赖
- 从一个技能调用另一个
- 在父子技能之间共享上下文
- 处理技能链中的部分失败

每个技能都是扁平、隔离的单元。组合通过 bash 脚本或手动编排临时发生。

## 展望

前进的道路很清晰：

**正式规范**：技能定义的最小但精确的模式。参数类型、必需 vs 可选字段、返回值契约。足够的结构用于工具，但没有 MCP 的冗长。

**层级技能**：对子技能的一等支持。技能应该能够声明对其他技能的依赖，以适当的上下文隔离调用它们，并程序化地处理它们的结果。

**技能注册表**：超越本地文件系统的可发现性。带有版本控制、评级和兼容性元数据的社区技能共享仓库。

**混合架构**：Skills 和 MCP 不是互斥的。对常见情况使用 Skills（上下文高效、Unix 原生），对有状态协议和严格类型回退到 MCP。让智能体根据任务选择。

Skills 的效率优势是真实的。生态系统只需要成熟。

## 结论

Agent Skills 在上下文效率上通过两种机制击败 MCP：

1. **渐进式披露**：启动时加载 frontmatter（每个技能约 20 tokens），按需加载完整内容
2. **脚本执行**：中间步骤保留在上下文之外，只返回结果

结合 LLM 对 Unix 模式的原生理解，Skills 为构建强大智能体提供了更可扩展的基础。

上下文是瓶颈。明智地使用它。

</div>
