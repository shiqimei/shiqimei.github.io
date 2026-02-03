---
title: "The Ralph Wiggum Loop: How a Bash While-True Became an AI Development Pattern"
date: 2026-02-03
excerpt: Inside the Ralph Wiggum plugin for Claude Code -- the stop hook architecture, completion promises, and the debate over independent context windows vs continuous sessions.
---

<img src="../images/ralph-wiggum/stop-hook-flow.svg" class="post-hero">

<div class="lang-en">

In July 2025, developer Geoffrey Huntley published a post titled "Ralph Wiggum as a software engineer" that would change how people use Claude Code. The core idea was a one-liner: wrap Claude Code in a bash loop, pipe in a prompt file, and let it run. When one session finishes, another starts immediately -- reading the same codebase, the same instructions, picking up where the last left off through files on disk.

```bash
while :; do cat PROMPT.md | claude-code ; done
```

Huntley named it after Ralph Wiggum from The Simpsons -- the kid who keeps going despite every setback. His description of the technique: Ralph builds playgrounds, but he comes home bruised because he fell off the slide. So you tune Ralph by adding a sign next to the slide saying "SLIDE DOWN, DON'T JUMP, LOOK AROUND." Eventually Ralph reads the signs and stops falling. When all Ralph thinks about is the signs, you get a new Ralph that doesn't feel defective at all.

The tuning metaphor is central. Huntley describes Ralph as "deterministically bad in an undeterministic world" -- the defects are identifiable and resolvable through prompt engineering. Each time Ralph does something bad, Ralph gets tuned, like a guitar.

A Y Combinator hackathon team put Ralph to the test and shipped 6 repositories overnight. The Register and VentureBeat covered it. Huntley taught the technique to engineers in San Francisco; one used it on their next contract and walked away with, in Huntley's words, "the wildest ROI."

## Installing the Plugin

```bash
/plugin install ralph-wiggum@claude-plugin-directory
```

That's it. The plugin is maintained in Anthropic's official plugin directory. Once installed, you get three slash commands: `/ralph-loop`, `/cancel-ralph`, and `/help`.

## How the Official Plugin Works

Anthropic engineers Daisy Hollman and Boris Cherny formalized the pattern into a Claude Code plugin. Instead of an external bash loop restarting the process, the plugin uses Claude Code's stop hook mechanism to prevent the session from ending.

The flow works like this: a user invokes `/ralph-loop` with a task description and an optional `--max-iterations` flag. The command runs a setup script that creates a state file at `.claude/ralph-loop.local.md` containing the prompt, iteration count, and maximum iterations in YAML frontmatter. Claude then begins working on the task.

When Claude finishes what it thinks is a complete unit of work and attempts to exit, the stop hook intercepts the exit. The hook reads Claude's transcript from stdin and checks for a `<promise>` tag -- a signal that Claude believes all work is genuinely done. If no promise is found and the iteration limit hasn't been reached, the hook returns exit code 2, which blocks the exit and re-feeds the prompt. Claude wakes up, re-reads the state file, and continues.

<img src="../images/ralph-wiggum/stop-hook-flow.svg" alt="Stop Hook Loop Lifecycle" style="width:100%;max-width:700px;margin:1.5rem 0;">

A typical invocation:

```
/ralph-loop Build a REST API with CRUD endpoints for a user model.
Run the test suite after each change. --max-iterations 20
```

The `<promise>` mechanism is the key design choice. Claude must explicitly declare completion by outputting a promise tag in its response. This prevents premature termination -- Claude can't just stop talking and have the session end. It must affirmatively state the work is done.

## Plugin File Structure

The plugin organizes into three directories matching Claude Code's plugin conventions:

```
.claude-plugin/
├── commands/
│   ├── ralph-loop.md       # /ralph-loop slash command
│   ├── cancel-ralph.md     # /cancel-ralph to stop the loop
│   └── help.md             # /help for usage info
├── hooks/
│   └── stop-hook.sh        # intercepts session exit
└── scripts/
    └── setup-ralph-loop.sh # creates state file
```

<img src="../images/ralph-wiggum/component-map.svg" alt="Plugin File Structure" style="width:100%;max-width:700px;margin:1.5rem 0;">

The state file at `.claude/ralph-loop.local.md` uses YAML frontmatter to track loop state:

```yaml
---
iteration: 3
max_iterations: 50
prompt: "Build a REST API with CRUD endpoints..."
promise: null
---
```

Three slash commands control the loop: `/ralph-loop` starts it, `/cancel-ralph` removes the state file to let the next exit succeed, and `/help` shows usage documentation.

## The Stop Hook Decision Logic

The stop hook script (`stop-hook.sh`) receives Claude's transcript on stdin every time Claude attempts to exit. Its decision tree is straightforward:

<img src="../images/ralph-wiggum/decision-flowchart.svg" alt="Stop Hook Decision Flowchart" style="width:100%;max-width:700px;margin:1.5rem 0;">

1. **State file exists?** If no `.claude/ralph-loop.local.md` file is found, the loop isn't active. Allow exit normally (code 0).

2. **Promise in output?** The hook greps the transcript for `<promise>` tags. If found, Claude has declared the work complete. Allow exit (code 0).

3. **Max iterations reached?** Compare the current iteration counter against the configured maximum. If reached, allow exit with a warning (code 0).

4. **Otherwise: block exit.** Increment the iteration counter in the state file and return exit code 2. Claude Code interprets code 2 as "do not exit" and re-feeds the prompt from the state file.

The elegance is in the exit codes. Claude Code's hook system uses a simple convention: 0 means proceed, 2 means block. No IPC, no sockets, no daemon process. Just a shell script reading stdin and returning an integer.

## The Context Window Debate

Here's where the original bash loop and the official plugin diverge architecturally, and where the community disagrees.

<img src="../images/ralph-wiggum/original-vs-plugin.svg" alt="Bash Loop vs Stop Hook Plugin" style="width:100%;max-width:700px;margin:1.5rem 0;">

The original `while :;` loop starts a **new process** each iteration. Each Claude Code invocation gets a fresh context window. It sees the codebase, the git history, and the prompt file -- nothing else. No memory of what it tried before, no accumulated conversation. If the previous iteration wrote buggy code, this iteration discovers it the same way a new developer would: by reading the files and running the tests.

The plugin keeps a **single session** alive. Conversation history accumulates across iterations. Claude remembers what it tried, what failed, what it decided. The context window fills up over time.

HumanLayer's analysis argued that the plugin misses the core insight of Huntley's original pattern. The value wasn't just in looping -- it was in doing small bits of work in independent context windows. Each fresh process avoids the accumulated confusion that comes from long conversations. A model that has been debugging for 30 iterations carries cognitive baggage from every failed approach.

The trade-off:

| Aspect | Bash Loop | Stop Hook Plugin |
|--------|-----------|-----------------|
| Context | Fresh each iteration | Accumulated history |
| Memory | No prior conversation | Full conversation retained |
| Cost per iteration | Higher (full prompt each time) | Lower (incremental) |
| Stuck behavior | Clean restart | May repeat failed approaches |
| Coordination | Via files on disk | Via conversation + files |

Community forks have explored middle ground. Some implementations periodically clear conversation history while keeping the loop alive. Others use the bash loop but with structured state files that persist learnings across iterations without carrying full conversation context.

## Everything Is a Loop

In January 2026, Huntley published a follow-up: "everything is a ralph loop." The argument goes beyond a coding trick. Standard software practice builds vertically, brick by brick, like Jenga. Huntley's claim is that with AI agents, everything becomes a loop instead.

Ralph isn't just forward mode (building autonomously) or reverse mode (clean rooming). It's a mindset that these computers can be programmed through loops. Software becomes clay on the pottery wheel -- if something isn't right, throw it back on the wheel.

Huntley is explicit about Ralph being **monolithic**: a single process, a single repository, one task per loop. He pushes back against the multi-agent trend: consider what microservices would look like if the microservices themselves are non-deterministic. Ralph scales vertically, not horizontally.

The operator's job shifts to watching the loop. When you see a failure domain, you put on your engineering hat and resolve it so it never happens again. In practice this means tuning the prompt, adding guardrails, or restructuring the task -- not writing the code yourself.

## Case Study: CURSED

The most striking demonstration of Ralph running at scale is CURSED, a Gen Z programming language that Huntley built by running Claude in a loop for three months.

The prompt was simple: make a programming language like Go, but with all lexical keywords swapped to Gen Z slang. Claude was given autonomy to implement whatever it deemed appropriate. The result is a compiled language with LLVM backend that produces binaries on macOS, Linux, and Windows.

The keyword mapping:

| Go | CURSED | Meaning |
|----|--------|---------|
| `func` | `slay` | function declaration |
| `var` | `sus` | variable |
| `import` | `yeet` | import |
| `package` | `vibe` | package |
| `return` | `damn` | return |
| `for` | `bestie` | for loop |
| `if` | `ready` | conditional |
| `true` | `based` | boolean true |
| `false` | `cringe` | boolean false |
| `*T` | `ඞT` | pointer (Amogus) |
| `//` | `fr fr` | line comment |

Comments use `fr fr` for single-line and `no cap...on god` for block comments. Pointers use the Among Us character ඞ.

The language has a compiler with interpreted and compiled modes, half-completed editor extensions for VSCode/Emacs/Vim, a Treesitter grammar, and a standard library. Huntley's position: any remaining problems can be solved by running more Ralph loops, operated by people who understand compilers and shape the output through prompts drawn from that expertise.

The project's stated success criterion: ending up in the Stack Overflow developer survey as either the most loved or most hated language. The next goal is bootstrapping -- rewriting the CURSED compiler in CURSED itself.

## Writing Effective Ralph Prompts

The loop is only as good as the prompt driving it. The best prompts share common traits: they define measurable completion criteria, break work into phases, and include verification commands.

<img src="../images/ralph-wiggum/best-practices.svg" alt="Use Case Matrix" style="width:100%;max-width:700px;margin:1.5rem 0;">

**Bad prompt:**
```
Make the app better. Fix any bugs you find
and add features that seem useful.
```

No exit condition, no verification, no scope boundary. This will loop until max iterations, burning tokens on increasingly speculative changes.

**Good prompt:**
```
Implement user authentication for the Express app.

Phase 1: Add bcrypt password hashing to the User model.
Phase 2: Create /login and /register endpoints.
Phase 3: Add JWT middleware for protected routes.

After each phase, run `npm test` and fix any failures.
When all tests pass for all 3 phases, output <promise>done</promise>.
```

TDD workflows are the ideal use case. The loop runs tests, Claude reads failures, fixes code, and re-runs. The cycle continues until the test suite goes green. The test suite *is* the completion criterion.

Cost awareness matters. Each iteration consumes tokens -- a 50-iteration loop on a complex codebase can cost $50-100+ in API usage. The `--max-iterations` flag isn't just a safety net; it's a budget control. Start with 10-20 iterations for well-scoped tasks and increase only when needed.

## Conclusion

The Ralph Wiggum loop reframes the role of the operator. Instead of writing code, you write the loop conditions. Instead of debugging, you write the tests that the loop debugs against. The model becomes the executor; the prompt becomes the program.

Huntley's framing goes further: software development as brick-by-brick Jenga is over. The loop is the new unit of work. The unresolved context window debate -- fresh processes vs continuous sessions -- reflects a deeper question in AI agent design: should agents accumulate state or start clean? The answer likely depends on the task. But the pattern itself, whether implemented as a bash one-liner or a plugin with exit code flow control, has become a fixture in how developers use Claude Code.

### References

- Geoffrey Huntley, [Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/) (Jul 2025)
- Geoffrey Huntley, [everything is a ralph loop](https://ghuntley.com/loop/) (Jan 2026)
- Geoffrey Huntley, [i ran Claude in a loop for three months, and it created a genz programming language called cursed](https://ghuntley.com/cursed/) (Sep 2025)
- [CURSED language website](https://cursed-lang.org/) and [source code](https://github.com/ghuntley/cursed)
- [Ralph Wiggum plugin source](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)

</div>

<div class="lang-zh">

2025年7月，开发者 Geoffrey Huntley 发表了一篇题为"Ralph Wiggum as a software engineer"的文章，改变了人们使用 Claude Code 的方式。核心思路是一行命令：将 Claude Code 包在 bash 循环里，管道传入提示文件，让它自己跑。一个会话结束，下一个立即启动——读取相同的代码库、相同的指令，通过磁盘上的文件接续上一次的工作。

```bash
while :; do cat PROMPT.md | claude-code ; done
```

Huntley 以辛普森一家中的 Ralph Wiggum 命名——那个屡败屡战的孩子。他对这项技术的描述是：Ralph 很擅长建游乐场，但他因为从滑梯上跳下来而回家时满身淤青。于是你调教 Ralph，在滑梯旁放一个牌子写着"滑下来，别跳，看看周围。"最终 Ralph 学会了看牌子，不再摔倒。当 Ralph 满脑子都是牌子时，你就得到了一个不再看起来有缺陷的 Ralph。

调教的比喻是核心。Huntley 将 Ralph 描述为"在不确定的世界中确定性地犯错"——缺陷是可识别的，可以通过提示工程来解决。每次 Ralph 做错事，Ralph 就被调教——像调吉他一样。

一个 Y Combinator 黑客松团队测试了 Ralph，一夜之间交付了 6 个仓库。The Register 和 VentureBeat 进行了报道。Huntley 在旧金山向工程师们传授了这个技术；其中一位在下一个合同中使用了它，用 Huntley 的话说，获得了"最疯狂的投资回报率"。

## 安装插件

```bash
/plugin install ralph-wiggum@claude-plugin-directory
```

安装完成。该插件托管在 Anthropic 官方插件目录中。安装后即可使用三个斜杠命令：`/ralph-loop`、`/cancel-ralph` 和 `/help`。

## 官方插件的工作原理

Anthropic 工程师 Daisy Hollman 和 Boris Cherny 将这个模式正式化为 Claude Code 插件。插件不使用外部 bash 循环重启进程，而是利用 Claude Code 的 stop hook 机制来阻止会话结束。

流程如下：用户使用 `/ralph-loop` 命令加上任务描述和可选的 `--max-iterations` 标志。命令运行一个设置脚本，在 `.claude/ralph-loop.local.md` 创建包含提示、迭代计数和最大迭代次数的 YAML 状态文件。然后 Claude 开始处理任务。

当 Claude 完成一个工作单元并尝试退出时，stop hook 拦截退出。Hook 从 stdin 读取 Claude 的输出，检查是否有 `<promise>` 标签——这是 Claude 表示所有工作已完成的信号。如果没有找到 promise 且迭代限制未达到，hook 返回退出码 2，阻止退出并重新传入提示。Claude 被唤醒，重新读取状态文件，继续工作。

<img src="../images/ralph-wiggum/stop-hook-flow.svg" alt="Stop Hook 循环生命周期" style="width:100%;max-width:700px;margin:1.5rem 0;">

典型调用方式：

```
/ralph-loop Build a REST API with CRUD endpoints for a user model.
Run the test suite after each change. --max-iterations 20
```

`<promise>` 机制是关键的设计选择。Claude 必须在输出中显式声明完成。这防止了过早终止——Claude 不能仅仅停止输出就结束会话，它必须明确表示工作已完成。

## 插件文件结构

插件按照 Claude Code 的插件规范组织为三个目录：

```
.claude-plugin/
├── commands/
│   ├── ralph-loop.md       # /ralph-loop 斜杠命令
│   ├── cancel-ralph.md     # /cancel-ralph 停止循环
│   └── help.md             # /help 使用说明
├── hooks/
│   └── stop-hook.sh        # 拦截会话退出
└── scripts/
    └── setup-ralph-loop.sh # 创建状态文件
```

<img src="../images/ralph-wiggum/component-map.svg" alt="插件文件结构" style="width:100%;max-width:700px;margin:1.5rem 0;">

`.claude/ralph-loop.local.md` 状态文件使用 YAML frontmatter 跟踪循环状态：

```yaml
---
iteration: 3
max_iterations: 50
prompt: "Build a REST API with CRUD endpoints..."
promise: null
---
```

三个斜杠命令控制循环：`/ralph-loop` 启动循环，`/cancel-ralph` 删除状态文件让下次退出成功，`/help` 显示使用文档。

## Stop Hook 决策逻辑

stop hook 脚本（`stop-hook.sh`）在 Claude 每次尝试退出时从 stdin 接收输出。其决策树非常直观：

<img src="../images/ralph-wiggum/decision-flowchart.svg" alt="Stop Hook 决策流程图" style="width:100%;max-width:700px;margin:1.5rem 0;">

1. **状态文件是否存在？** 如果未找到 `.claude/ralph-loop.local.md`，循环未激活，正常允许退出（代码 0）。

2. **输出中是否有 Promise？** Hook 在输出中搜索 `<promise>` 标签。如果找到，Claude 已声明工作完成，允许退出（代码 0）。

3. **是否达到最大迭代次数？** 比较当前迭代计数器与配置的最大值。如果达到，带警告允许退出（代码 0）。

4. **否则：阻止退出。** 递增状态文件中的迭代计数器，返回退出码 2。Claude Code 将代码 2 解释为"不要退出"并重新传入提示。

优雅之处在于退出码的使用。Claude Code 的 hook 系统采用简单的约定：0 表示继续，2 表示阻止。没有 IPC，没有 socket，没有守护进程。只是一个读取 stdin 并返回整数的 shell 脚本。

## 上下文窗口之争

这是原始 bash 循环与官方插件在架构上分歧的地方，也是社区存在争议的地方。

<img src="../images/ralph-wiggum/original-vs-plugin.svg" alt="Bash 循环与 Stop Hook 插件对比" style="width:100%;max-width:700px;margin:1.5rem 0;">

原始 `while :;` 循环每次迭代启动一个**新进程**。每次 Claude Code 调用获得全新的上下文窗口。它只能看到代码库、git 历史和提示文件——没有其他内容。不记得之前尝试过什么，没有累积的对话。如果上一次迭代写了有问题的代码，这次迭代会像新开发者一样发现它：通过阅读文件和运行测试。

插件保持**单一会话**存活。对话历史在迭代间累积。Claude 记得它尝试过什么、什么失败了、做了什么决定。上下文窗口随时间填满。

HumanLayer 的分析认为，插件遗漏了 Huntley 原始模式的核心洞察。其价值不仅在于循环——而在于在独立上下文窗口中完成小块工作。每个新进程避免了长对话带来的累积混乱。一个已经调试了 30 次迭代的模型，携带着每次失败尝试的认知包袱。

权衡对比：

| 方面 | Bash 循环 | Stop Hook 插件 |
|------|-----------|---------------|
| 上下文 | 每次迭代全新 | 累积历史 |
| 记忆 | 无先前对话 | 完整对话保留 |
| 每次迭代成本 | 较高（每次完整提示） | 较低（增量式） |
| 卡住行为 | 干净重启 | 可能重复失败方法 |
| 协调方式 | 通过磁盘文件 | 通过对话 + 文件 |

社区分支探索了中间路线。一些实现在保持循环存活的同时定期清除对话历史。另一些使用 bash 循环但配合结构化状态文件，在迭代间保留经验而不携带完整对话上下文。

## 一切皆循环

2026年1月，Huntley 发表了后续文章："everything is a ralph loop"。这个论点超越了编码技巧。标准软件实践是垂直地一块砖一块砖地砌——像搭积木。Huntley 的主张是，有了 AI 代理，一切都变成了循环。

Ralph 不仅仅是前向模式（自主构建）或反向模式（净室开发）。它是一种思维方式：这些计算机确实可以通过循环来编程。软件变成了陶轮上的泥土——如果有什么不对，就把它扔回陶轮上。

Huntley 明确指出 Ralph 是**单体的**：单进程、单仓库、每次循环一个任务。他反对多代理趋势：想想如果微服务本身是不确定的，那微服务会是什么样子。Ralph 是垂直扩展，不是水平扩展。

操作者的工作转变为观察循环。当你看到一个失败域，你戴上工程师的帽子去解决它，确保它不再发生。在实践中，这意味着调整提示、添加护栏或重构任务——而不是自己写代码。

## 案例研究：CURSED

Ralph 大规模运行的最引人注目的展示是 CURSED——Huntley 通过让 Claude 在循环中运行三个月所构建的 Gen Z 编程语言。

提示很简单：做一个像 Go 一样的编程语言，但所有词法关键字都换成 Z 世代俚语。Claude 被赋予了自主权来实现它认为合适的任何功能。结果是一个基于 LLVM 后端的编译型语言，可在 macOS、Linux 和 Windows 上生成二进制文件。

关键字映射：

| Go | CURSED | 含义 |
|----|--------|------|
| `func` | `slay` | 函数声明 |
| `var` | `sus` | 变量 |
| `import` | `yeet` | 导入 |
| `package` | `vibe` | 包 |
| `return` | `damn` | 返回 |
| `for` | `bestie` | for 循环 |
| `if` | `ready` | 条件判断 |
| `true` | `based` | 布尔真 |
| `false` | `cringe` | 布尔假 |
| `*T` | `ඞT` | 指针（Amogus） |
| `//` | `fr fr` | 行注释 |

注释使用 `fr fr` 表示单行注释，`no cap...on god` 表示块注释。指针使用 Among Us 角色 ඞ。

该语言有一个支持解释和编译两种模式的编译器、半完成的 VSCode/Emacs/Vim 编辑器扩展、Treesitter 语法和标准库。Huntley 的立场是：CURSED 中发现的任何问题都可以通过运行更多的 Ralph 循环来解决，由理解编译器的人操作，通过基于专业知识的提示来塑造输出。

项目的成功标准：出现在 Stack Overflow 开发者调查中，成为最受欢迎或最受厌恶的语言。下一个目标是自举——用 CURSED 重写 CURSED 编译器本身。

## 编写有效的 Ralph 提示

循环的效果取决于驱动它的提示质量。好的提示有共同特征：定义可衡量的完成标准、将工作分解为阶段、包含验证命令。

<img src="../images/ralph-wiggum/best-practices.svg" alt="用例矩阵" style="width:100%;max-width:700px;margin:1.5rem 0;">

**差的提示：**
```
Make the app better. Fix any bugs you find
and add features that seem useful.
```

没有退出条件，没有验证，没有范围界限。这会循环到最大迭代次数，在越来越投机的更改上消耗 token。

**好的提示：**
```
Implement user authentication for the Express app.

Phase 1: Add bcrypt password hashing to the User model.
Phase 2: Create /login and /register endpoints.
Phase 3: Add JWT middleware for protected routes.

After each phase, run `npm test` and fix any failures.
When all tests pass for all 3 phases, output <promise>done</promise>.
```

TDD 工作流是理想的用例。循环运行测试，Claude 读取失败，修复代码，重新运行。周期持续直到测试套件全部通过。测试套件*本身*就是完成标准。

成本意识很重要。每次迭代消耗 token——在复杂代码库上运行 50 次迭代可能花费 $50-100+ 的 API 费用。`--max-iterations` 标志不仅是安全网，也是预算控制。对明确范围的任务从 10-20 次迭代开始，只在需要时增加。

## 结论

Ralph Wiggum 循环重新定义了操作者的角色。你不再编写代码，而是编写循环条件。你不再调试，而是编写循环调试所依据的测试。模型变成了执行者，提示变成了程序。

Huntley 的表述更进一步：像搭积木一样一砖一瓦的软件开发已经结束。循环是新的工作单元。未解决的上下文窗口之争——新进程还是连续会话——反映了 AI 代理设计中更深层的问题：代理应该累积状态还是从头开始？答案可能取决于任务。但这个模式本身，无论是作为 bash 单行命令还是使用退出码流控的插件，已经成为开发者使用 Claude Code 的固定范式。

### 参考资料

- Geoffrey Huntley, [Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/) (2025年7月)
- Geoffrey Huntley, [everything is a ralph loop](https://ghuntley.com/loop/) (2026年1月)
- Geoffrey Huntley, [i ran Claude in a loop for three months, and it created a genz programming language called cursed](https://ghuntley.com/cursed/) (2025年9月)
- [CURSED 语言网站](https://cursed-lang.org/) 和 [源代码](https://github.com/ghuntley/cursed)
- [Ralph Wiggum 插件源码](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)

</div>
