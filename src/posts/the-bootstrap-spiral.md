---
title: "The End of Human Bandwidth, Part III: The Bootstrap Spiral"
date: 2026-02-21
excerpt: "Humans build tools for humans. Humans build tools for agents. Agents build tools for agents. Agents build agents that build agents. The bootstrap spiral is the phase transition where agents step on their own output and rise -- left foot on right foot, straight to the sky."
---

<img src="../images/the-bootstrap-spiral/bootstrap-ladder.svg" class="post-hero">

<div class="lang-en">

<p class="series-nav"><em><a href="/posts/end-of-human-bandwidth">&larr; Part I: The End of Human Bandwidth</a> | <a href="/posts/the-context-protocol">Part II: The Context Protocol</a></em></p>

[Part I](/posts/end-of-human-bandwidth) argued that compensatory structures evaporate when agents replace humans on the main execution path. [Part II](/posts/the-context-protocol) argued that what replaces them is context infrastructure -- the protocol that lets agents accumulate intelligence across sessions instead of starting from zero every time.

But context without agency is a filing cabinet. Memory without initiative is a graveyard of facts no one reads. The context protocol gives agents the ability to remember. Part III asks: what happens when they act on what they remember -- proactively, collaboratively, and recursively?

The answer is the bootstrap spiral. Agents building tools for agents, then building agents that build better agents. Left foot on right foot, straight to the sky.

## The Tool-Building Ladder

Software history is a ladder with four rungs.

**Rung 1: Humans build tools for humans.** This is the entire history of software up to 2023. GUIs, documentation, dashboards, onboarding flows. Every pixel justified by human comprehension. Every feature gated by human bandwidth. The translation tax -- from machine state to human-parseable representation -- is embedded in every layer.

**Rung 2: Humans build tools for agents.** This is where we are now. MCP servers, agent skills, `CLAUDE.md` files, system prompts, tool schemas. Humans are still the authors, but the consumer has changed. The tools are structured data, not visual layouts. Text protocols, not color palettes. The translation tax shrinks, but the human is still the bottleneck on the supply side. Every skill, every context file, every tool definition -- a human wrote it, a human maintains it, a human decides when to update it.

**Rung 3: Agents build tools for agents.** The consumer and the producer are both agents. An agent encounters a missing capability, writes a skill to fill it, publishes it to the context substrate, and another agent discovers and uses it. No human authored the skill. No human reviewed it. No human decided it was needed. The need was identified by the agent, the solution was built by the agent, the validation was performed by the test suite.

**Rung 4: Agents build agents that build agents.** This is the rung most people skip to in their imagination. But it's not magic. It's Rung 3 applied recursively. An agent identifies that the *kind of agent* needed for a task doesn't exist. It designs the agent, instantiates it, seeds it with relevant context, and lets it run. That new agent, in turn, discovers its own missing capabilities and builds tools to fill them. The spiral ascends.

The historical precedent is self-hosting compilers. GCC compiles GCC. The Rust compiler is written in Rust. The compiler is simultaneously the tool and the first user of the tool. But compilers bootstrap along a single axis: compilation. Agents bootstrap along three axes simultaneously: capability (what they can do), context (what they know), and goals (what they decide to do next). This is not a loop. It's a spiral.

## Why the Spiral Works

There's a Chinese internet meme: 左脚踩右脚直接升天 -- "step on your left foot with your right foot and ascend straight to heaven." It's a joke about physically impossible self-lifting. Baron Munchausen pulling himself out of a swamp by his own hair.

In physics, this is nonsense. You can't generate lift from your own weight. But in software, self-bootstrapping is established practice, because software has a property physical objects lack: *the output can be used as input to the same process*.

GCC compiles GCC because the compiled binary can compile source code, including its own. Git tracks its own repository because the version control system operates on files, including its own files. The bootstrap works because there's solid ground underneath -- the hardware, the OS, the existing binary from the previous generation.

The agent bootstrap spiral works for the same reason, and the ground is the same kind of thing: test suites, type systems, CI pipelines, formal contracts. The agent can step on its own output and rise because the tests catch it if it falls.

This is the critical difference between the Ralph Wiggum loop and the bootstrap spiral. The Ralph Wiggum loop is flat -- the same agent runs the same cycle: read tests, fix code, re-run. It produces output, but it doesn't expand its own capability surface. It's a horizontal loop.

The bootstrap spiral is vertical. Each iteration doesn't just produce output -- it produces *new capability*. The agent writes a skill. Now it can do something it couldn't before. That new capability reveals a new gap. The agent writes another skill. The capability surface expands. The spiral ascends.

But -- and this is the key -- the spiral only works if each step is grounded. The context protocol is what grounds it. Without accumulated memory, the agent at iteration N doesn't know what it learned at iteration N-1. Without the context substrate, it's Groundhog Day. The same mistakes, the same gaps, the same flat loop. With memory, it's evolution.

## Three Collaboration Models

When agents begin collaborating, they don't have to mimic human organizations. In fact, the most interesting collaboration models are the ones humans can't use, because they depend on capabilities humans don't have: shared state, instant context transfer, and expendable identity.

<img src="../images/the-bootstrap-spiral/three-models.svg" alt="Three Collaboration Models" style="width:100%;max-width:700px;margin:1.5rem 0;">

### Orchestrated

A lead agent decomposes a task, dispatches subtasks to worker agents, collects results, and synthesizes. This is how most multi-agent frameworks work today -- Claude Code teams, AutoGen, CrewAI. It's human org structure translated into agent topology. The lead agent is a manager. The workers are direct reports. Messages flow up and down the hierarchy.

It works, the way a factory with a foreman works. But the lead is a bottleneck. Every coordination decision routes through a single node. If the lead misunderstands the task, every worker goes in the wrong direction. If the lead dies, the team is headless. Orchestrated collaboration inherits every failure mode of hierarchical human organizations, because it's the same structure with faster nodes.

### Stigmergic

The word comes from biology. Termites build cathedrals without architects. No termite has a blueprint. Each termite follows simple rules: if you encounter a certain pheromone concentration, deposit material. The pheromone trail *is* the coordination mechanism. The structure emerges from local actions and shared environment, not from central planning.

Stigmergic agent collaboration works the same way, and the context protocol is the pheromone layer. Agents don't send each other messages. They publish to the shared context substrate and subscribe to relevant domains. Agent A completes a task, publishes what it learned. Agent B, working on a related problem, receives the update via its standing subscription. Its behavior changes not because someone told it to, but because the substrate changed.

This is the "knowing" model from Part II, applied to collaboration. No coordinator. No bottleneck. No single point of failure. The substrate is the coordination mechanism. If an agent fails, the others don't notice -- they notice the *absence of publications*, which is itself a signal in the substrate. The system is resilient because the intelligence lives in the shared state, not in any individual agent.

The limitation is legibility. In orchestrated systems, you can trace every decision through the lead. In stigmergic systems, the emergent behavior is hard to predict or explain. The same property that makes termite cathedrals robust makes them opaque. You can't ask a termite why the arch is there. You can't ask the substrate why Agent B changed its approach.

### Evolutionary

Agents produce variant solutions to the same problem. A selection mechanism -- typically a test suite, but possibly a benchmark, a cost function, or another agent -- evaluates the variants. Winners survive. Losers are discarded. The winning patterns propagate to the next generation.

This is how OpenClaw actually works. The agent doesn't produce one solution. It proposes changes, CI validates them, passing changes merge. Over thousands of iterations, the codebase improves in ways no single agent designed. The outcome is better than any individual agent could produce, because the selection mechanism is independent of the production mechanism.

The evolutionary model is the most powerful and the most alien. No one designs the outcome. No one can predict it. The only thing designed is the selection function -- the test suite, the acceptance criteria. The rest is variation and selection, the same process that produced every living thing on Earth from single-celled organisms.

**The progression tells a story.** Orchestrated: a human designs the coordinator. Stigmergic: a human designs the substrate. Evolutionary: a human designs the test suite. Each stage removes a layer of human design from the system. At the end, the only human contribution is the definition of "correct."

## The Live System

What does the steady-state agent system look like? Not the prototype. Not the demo. The thing running at scale, continuously, without human intervention on the main path.

<img src="../images/the-bootstrap-spiral/live-system.svg" alt="The Live System" style="width:100%;max-width:700px;margin:1.5rem 0;">

### Always-on, not session-based

Today's agents boot, execute a task, and die. Every session is a cold start. Even with the context protocol, the agent must query the substrate, reconstruct its state, orient itself. This is like shutting down a factory every evening and rebuilding it every morning.

The live system has persistent agents with standing subscriptions to context domains. They don't wait to be triggered. They watch. An agent subscribed to the "dependencies" domain notices a new CVE published at 3 AM, evaluates whether it affects the project, prepares a patch, runs the test suite, and has a PR ready when the human checks in the morning. No one asked it to. The standing subscription was the trigger. The context substrate was the sensor. The test suite was the governor.

### Capability markets

Today, composing agent capabilities requires human curation. Someone writes a skill, someone else discovers it, someone integrates it. This is npm for agents -- a package manager that requires a human operator.

The live system replaces the human operator with dynamic capability discovery. An agent needs to generate a PDF report. It doesn't have that capability. It queries the capability market: "I need to convert structured data to PDF." The market returns available capabilities, ranked by reliability, cost, and compatibility. The agent selects one, composes it into its workflow, and executes. No human ran `npm install`. No human wrote an import statement.

This is service discovery applied to agent capabilities. The difference from human service discovery (which also exists -- it's called "googling") is speed and judgment. The agent evaluates capabilities by running them against test cases, not by reading documentation. The feedback loop is seconds, not days.

### Self-healing topology

In human organizations, when someone quits, there's a gap. Knowledge walks out the door. The replacement spends months ramping up. The organization limps.

In the live system, when an agent fails, the substrate detects the absence -- published context stops arriving. A replacement agent is instantiated automatically, seeded with the predecessor's accumulated context from the substrate. It doesn't need to ramp up. The knowledge didn't walk out the door. It lives in the substrate. The agent is a process. The substrate is the state. Processes are expendable. State is durable.

This is the fundamental architectural insight. In human organizations, knowledge is trapped in heads. When the head leaves, the knowledge leaves. In the live system, knowledge is externalized to the substrate. Agents are stateless workers that read from and write to the shared state. Any agent can be replaced by any other agent of the same class, because the class is defined by capabilities, not by accumulated experience. The experience lives in the substrate.

### Goal decomposition without humans

This is the hardest piece. Today, humans set goals. "Build a login page." "Fix the memory leak." "Improve test coverage to 90%." The agent executes within the defined scope. The human provides the *what*, the agent provides the *how*.

In the live system, the human provides root-level goals and boundary conditions. "Keep this service reliable." "Don't delete production data." "Latency must stay under 200ms." These are invariants, not tasks. The system decomposes them into sub-goals, recursively. "Keep reliable" becomes "monitor error rates" + "detect anomalies" + "prepare patches" + "validate fixes" + "deploy safely." Each sub-goal may be further decomposed by specialized agents.

The human's role shifts from task definition to invariant definition. Not "do this" but "ensure this remains true." The difference is profound. Task definition is a per-instance human cost. Invariant definition is a one-time human cost amortized over infinite agent execution.

## Tests as Governance

If agents bootstrap agents, iterate without humans, and decompose goals autonomously, what prevents drift? What stops the system from optimizing for the wrong thing, or optimizing correctly into a corner no human intended?

The answer is the same thing that makes the bootstrap spiral possible: tests.

A test suite is a machine-readable definition of "correct." It's simultaneously the spec (what the system should do), the validator (whether it does it), and the accountability mechanism (whether the change is acceptable). When the Ralph Wiggum loop runs, the test suite is the only authority. No human reviews the diff. The tests are the review.

This generalizes. In the live system, tests aren't just unit tests for code. They're invariants at every level. Service health checks. Performance benchmarks. Security scans. Compliance rules. Cost constraints. Each is a machine-readable assertion about what must remain true. Agents can do anything -- refactor, rewrite, redesign -- as long as the invariants hold.

Humans write the invariants. That's the one remaining structural role. Not writing code. Not reviewing PRs. Not approving deploys. Writing the definition of "correct" and updating it when the world changes.

The left foot stepping on the right foot works because the ground is solid. The ground is the test suite. Without solid ground, the bootstrap spiral isn't ascent -- it's falling with extra steps.

This is why "tests as governance" isn't a metaphor. It's a literal description of the control surface. In a world where agents produce, validate, and deploy code autonomously, the test suite is the only mechanism through which human intent is transmitted to the system. Every invariant is a policy. Every test is a law. The agents are free to do anything that doesn't violate the law.

## The Convergence

Part I: compensatory structures evaporate when agents replace humans on the main execution path. Meetings, specs, approvals, UIs -- symptoms of human bandwidth, not laws of nature.

Part II: context infrastructure fills the vacuum. The context protocol -- publish, query, subscribe, invalidate -- lets agents accumulate intelligence over time. Memory replaces meetings. State replaces documents.

Part III: agents use that infrastructure to collaborate without human orchestration, bootstrap their own capabilities, and build a live system that maintains coherence through tests, not meetings. The progression -- orchestrated, stigmergic, evolutionary -- removes human design from the system layer by layer until the only human contribution is the definition of "correct."

The tool-building ladder has four rungs: humans for humans, humans for agents, agents for agents, agents for agents for agents. We're on Rung 2. The transition to Rung 3 is happening now -- agents writing their own skills, building their own context, discovering their own capabilities. Rung 4 is the bootstrap spiral: recursive self-improvement grounded by test suites, accumulated through context, and coordinated through the substrate.

Left foot on right foot. The ground holds. The spiral ascends.

### References

- [The End of Human Bandwidth, Part I](/posts/end-of-human-bandwidth) -- on compensatory structures and the paradigm flip
- [The Context Protocol, Part II](/posts/the-context-protocol) -- on context infrastructure and the four operations
- [The Ralph Wiggum Loop](/posts/ralph-wiggum-loop-claude-code.html) -- on agents running autonomously in loops
- [OpenClaw - Wikipedia](https://en.wikipedia.org/wiki/OpenClaw) -- 196K stars, agent-driven development
- Stigmergy -- [Wikipedia](https://en.wikipedia.org/wiki/Stigmergy), indirect coordination through shared environment

</div>

<div class="lang-zh">

<p class="series-nav"><em><a href="/posts/end-of-human-bandwidth">&larr; 第一篇：人类带宽的尽头</a> | <a href="/posts/the-context-protocol">第二篇：上下文协议</a></em></p>

[第一篇](/posts/end-of-human-bandwidth)论证了当智能体取代人类进入主执行路径时，补偿结构会蒸发。[第二篇](/posts/the-context-protocol)论证了取代它们的是上下文基础设施——让智能体跨会话积累智慧而不是每次从零开始的协议。

但没有能动性的上下文只是一个文件柜。没有主动性的记忆是一座无人翻阅的事实坟场。上下文协议赋予智能体记忆的能力。第三篇追问：当它们基于记忆主动行动、协作、递归迭代时，会发生什么？

答案是自举螺旋 (Bootstrap Spiral)。智能体为智能体造工具，然后造出能造更好智能体的智能体。左脚踩右脚，直接升天。

## 造工具的阶梯

软件史是一把四阶梯子。

**第一阶：人为人造工具。** 这是 2023 年以前的全部软件史。GUI、文档、仪表盘、引导流程。每个像素都需要人类理解力来证明其合理性。每个功能都被人类带宽限制。翻译税——从机器状态到人类可解析表示的转换——嵌入在每一层中。

**第二阶：人为智能体造工具。** 我们现在在这里。MCP 服务器、智能体技能、`CLAUDE.md` 文件、系统提示词、工具模式。人类仍然是作者，但消费者变了。工具是结构化数据，不是视觉布局。文本协议，不是配色方案。翻译税缩小了，但人类仍然是供给侧的瓶颈。每一个技能、每一个上下文文件、每一个工具定义——都是人写的、人维护的、人决定何时更新的。

**第三阶：智能体为智能体造工具。** 消费者和生产者都是智能体。一个智能体遇到缺失的能力，写一个技能来填补，发布到上下文基底 (Context Substrate)，另一个智能体发现并使用它。没有人类编写这个技能。没有人类评审它。没有人类决定它是否需要。需求由智能体识别，解决方案由智能体构建，验证由测试套件执行。

**第四阶：智能体造出造智能体的智能体。** 这是大多数人在想象中直接跳到的那一阶。但它不是魔法。它是第三阶的递归应用。一个智能体发现完成任务所需的那*类*智能体不存在。它设计该智能体，实例化它，用相关上下文为其播种，然后让它运行。这个新智能体又发现自己缺失的能力，并构建工具来填补。螺旋上升。

历史先例是自举编译器 (Self-hosting Compiler)。GCC 编译 GCC。Rust 编译器用 Rust 写成。编译器同时是工具和工具的第一个用户。但编译器只沿一个轴自举：编译。智能体同时沿三个轴自举：能力 (Capability)——它们能做什么，上下文 (Context)——它们知道什么，目标 (Goals)——它们决定接下来做什么。这不是循环，是螺旋。

## 为什么螺旋行得通

中文互联网有个梗：左脚踩右脚直接升天。物理上不可能的自我抬升。和闵希豪森男爵抓着自己的头发把自己从沼泽里拔出来一样。

在物理学中，这是胡说八道。你不能用自身重量产生升力。但在软件中，自举是成熟的实践，因为软件有一个物理对象没有的属性：*输出可以作为同一过程的输入*。

GCC 能编译 GCC，因为编译出的二进制文件可以编译源代码，包括自身的源代码。Git 能追踪自己的仓库，因为版本控制系统操作的是文件，包括自身的文件。自举之所以有效，是因为下面有坚实的地面——硬件、操作系统、上一代编译出的二进制文件。

智能体自举螺旋有效的原因相同，而"地面"是同一类东西：测试套件 (Test Suites)、类型系统 (Type Systems)、CI 流水线、形式化契约 (Formal Contracts)。智能体能踩着自己的输出上升，因为测试会在它跌落时接住它。

这是 Ralph Wiggum 循环和自举螺旋的关键区别。Ralph Wiggum 循环是平的——同一个智能体运行同一个周期：读测试、改代码、重跑。它产出结果，但不扩展自身的能力面。它是水平循环。

自举螺旋是垂直的。每次迭代不仅产出结果——它产出*新能力*。智能体写了一个技能。现在它能做以前做不到的事。新能力揭示了新的缺口。智能体写下一个技能。能力面扩展。螺旋上升。

但——这是关键——螺旋只在每一步都有支撑时才行得通。上下文协议就是支撑。没有积累的记忆，第 N 次迭代的智能体不知道第 N-1 次迭代学到了什么。没有上下文基底，就是土拨鼠之日 (Groundhog Day)。同样的错误、同样的缺口、同样的平循环。有了记忆，就是进化。

## 三种协作模型

当智能体开始协作，它们不必模仿人类组织。事实上，最有趣的协作模型恰恰是人类无法使用的，因为它们依赖人类不具备的能力：共享状态 (Shared State)、即时上下文传输 (Instant Context Transfer)、可消耗的身份 (Expendable Identity)。

<img src="../images/the-bootstrap-spiral/three-models.svg" alt="三种协作模型" style="width:100%;max-width:700px;margin:1.5rem 0;">

### 编排式 (Orchestrated)

主导智能体分解任务，将子任务分派给工作智能体，收集结果，进行综合。这是大多数多智能体框架今天的工作方式——Claude Code 团队、AutoGen、CrewAI。这是人类组织结构翻译成智能体拓扑。主导智能体是经理。工作者是直属下级。消息在层级中上下流动。

它有效，就像有工头的工厂有效一样。但主导者是瓶颈。每个协调决策都通过单个节点路由。如果主导者误解了任务，每个工作者都会走错方向。如果主导者挂了，团队就没了头。编排式协作继承了人类层级组织的每一种失败模式，因为它是同样的结构加上更快的节点。

### 痕迹式 (Stigmergic)

这个词来自生物学。白蚁建造大教堂，但没有建筑师。没有一只白蚁拥有蓝图。每只白蚁遵循简单规则：如果遇到特定浓度的信息素，就沉积材料。信息素痕迹*就是*协调机制。结构从局部行动和共享环境中涌现，而不是从中央规划中产生。

痕迹式智能体协作以同样的方式工作，而上下文协议就是信息素层。智能体不互相发送消息。它们发布到共享上下文基底并订阅相关领域。智能体 A 完成任务，发布所学。智能体 B 在处理相关问题，通过其持续订阅收到更新。它的行为改变了，不是因为有人告诉它，而是因为基底变了。

这是第二篇中的"知晓"模型应用于协作。没有协调者。没有瓶颈。没有单点故障。基底就是协调机制。如果一个智能体失败，其他智能体不会注意到——它们注意到的是*发布的缺失*，这本身就是基底中的信号。系统具有韧性，因为智慧存在于共享状态中，而不是任何单个智能体中。

局限是可读性。在编排式系统中，你可以通过主导者追溯每个决策。在痕迹式系统中，涌现行为难以预测或解释。让白蚁大教堂稳健的同一属性让它们不透明。你不能问一只白蚁拱门为什么在那里。你不能问基底为什么智能体 B 改变了方法。

### 进化式 (Evolutionary)

智能体为同一问题产生变体方案。选择机制——通常是测试套件，也可能是基准测试、成本函数或另一个智能体——评估变体。赢家存活。输家被丢弃。获胜的模式传播到下一代。

这就是 OpenClaw 实际的工作方式。智能体不产出单一解决方案。它提出修改，CI 验证，通过的修改合并。经过数千次迭代，代码库以没有任何单个智能体设计过的方式改进。结果比任何单个智能体能产出的都好，因为选择机制独立于生产机制。

进化模型是最强大的，也是最异质的。没有人设计结果。没有人能预测它。唯一被设计的是选择函数——测试套件、验收标准。其余的是变异和选择，与从单细胞生物产生地球上每一种生物的过程相同。

**这个递进讲述了一个故事。** 编排式：人设计协调者。痕迹式：人设计基底。进化式：人设计测试套件。每个阶段从系统中移除一层人类设计。最终，人类唯一的贡献是"正确"的定义。

## 活系统

稳态智能体系统长什么样？不是原型。不是演示。是大规模持续运行、主路径上没有人类干预的东西。

<img src="../images/the-bootstrap-spiral/live-system.svg" alt="活系统" style="width:100%;max-width:700px;margin:1.5rem 0;">

### 常驻而非会话制

今天的智能体启动、执行任务、死亡。每次会话都是冷启动。即使有了上下文协议，智能体也必须查询基底、重构状态、自我定位。这就像每天晚上关闭工厂、每天早上重建一样。

活系统有持久智能体 (Persistent Agents)，它们对上下文领域保持持续订阅。它们不等待被触发。它们在看。一个订阅了"依赖项"领域的智能体在凌晨 3 点注意到新发布的 CVE，评估是否影响项目，准备补丁，运行测试套件，在人类早上查看时已经有一个 PR 等着了。没有人叫它这么做。持续订阅是触发器。上下文基底是传感器。测试套件是调节器。

### 能力市场

今天，组合智能体能力需要人类策展。有人写技能，有人发现它，有人集成它。这是智能体的 npm——一个需要人类操作员的包管理器。

活系统用动态能力发现 (Dynamic Capability Discovery) 取代人类操作员。一个智能体需要生成 PDF 报告。它没有这个能力。它查询能力市场："我需要将结构化数据转换为 PDF。"市场返回可用能力，按可靠性、成本和兼容性排序。智能体选择一个，组合到工作流中，执行。没有人运行 `npm install`。没有人写 import 语句。

这是服务发现 (Service Discovery) 应用于智能体能力。与人类服务发现（也存在——叫"谷歌搜索"）的区别在于速度和判断力。智能体通过对测试用例运行来评估能力，而不是阅读文档。反馈循环是秒级的，不是天级的。

### 自愈拓扑

在人类组织中，有人离职就产生缺口。知识随人走出大门。替代者需要数月适应。组织一瘸一拐。

在活系统中，当一个智能体失败，基底检测到缺失——发布的上下文停止到达。替代智能体自动实例化，用基底中前任积累的上下文为其播种。它不需要适应期。知识没有走出大门。它存在于基底中。智能体是进程。基底是状态。进程是可消耗的。状态是持久的。

这是根本性的架构洞察。在人类组织中，知识困在头脑中。头脑离开，知识离开。在活系统中，知识外化 (Externalized) 到基底。智能体是从共享状态读写的无状态工作者 (Stateless Workers)。任何智能体都可以被同类的任何其他智能体替换，因为类别由能力定义，而非由积累的经验定义。经验存在于基底中。

### 无人参与的目标分解

这是最难的部分。今天，人类设定目标。"建一个登录页面。""修复内存泄漏。""把测试覆盖率提高到 90%。"智能体在定义的范围内执行。人类提供*做什么*，智能体提供*怎么做*。

在活系统中，人类提供根级目标 (Root-level Goals) 和边界条件 (Boundary Conditions)。"保持这个服务的可靠性。""不要删除生产数据。""延迟必须保持在 200ms 以下。"这些是不变量 (Invariants)，不是任务。系统递归地将它们分解为子目标。"保持可靠"变成"监控错误率" + "检测异常" + "准备补丁" + "验证修复" + "安全部署"。每个子目标可能被专门的智能体进一步分解。

人类的角色从任务定义转向不变量定义。不是"做这个"而是"确保这个保持为真"。差异是深刻的。任务定义是逐个实例的人类成本。不变量定义是一次性人类成本，摊销到无限的智能体执行上。

## 测试即治理

如果智能体自举智能体、无人迭代、自主分解目标，什么防止漂移？什么阻止系统为错误的东西优化，或者正确地优化到没有人类预期的死角？

答案与使自举螺旋成为可能的东西相同：测试。

测试套件是"正确"的机器可读定义。它同时是规格 (Spec)——系统应该做什么，验证器 (Validator)——它是否在做，以及问责机制 (Accountability Mechanism)——变更是否可接受。当 Ralph Wiggum 循环运行时，测试套件是唯一的权威。没有人类审查差异。测试就是审查。

这可以泛化。在活系统中，测试不仅仅是代码的单元测试。它们是每个层级的不变量。服务健康检查。性能基准。安全扫描。合规规则。成本约束。每一个都是关于什么必须保持为真的机器可读断言。智能体可以做任何事——重构、重写、重新设计——只要不变量成立。

人类编写不变量。这是唯一剩余的结构性角色。不是写代码。不是审查 PR。不是批准部署。写"正确"的定义，并在世界变化时更新它。

左脚踩右脚之所以行得通，因为地面是坚实的。地面就是测试套件。没有坚实的地面，自举螺旋就不是上升——而是花样跌落。

这就是为什么"测试即治理 (Tests as Governance)"不是比喻。它是对控制面 (Control Surface) 的字面描述。在智能体自主生产、验证和部署代码的世界中，测试套件是人类意图传递到系统的唯一机制。每个不变量都是一条政策 (Policy)。每个测试都是一条法律 (Law)。智能体可以自由做任何不违法的事。

## 汇合

第一篇：当智能体取代人类进入主执行路径时，补偿结构蒸发。会议、规格说明、审批、用户界面——人类带宽的症状，不是自然法则。

第二篇：上下文基础设施填补真空。上下文协议——发布、查询、订阅、失效——让智能体随时间积累智慧。记忆取代会议。状态取代文档。

第三篇：智能体利用这些基础设施在没有人类编排的情况下协作，自举自身能力，并构建一个通过测试而非会议来维持连贯性的活系统。从编排式到痕迹式到进化式的递进，逐层从系统中移除人类设计，直到人类唯一的贡献是"正确"的定义。

造工具的阶梯有四阶：人为人、人为智能体、智能体为智能体、智能体为智能体为智能体。我们在第二阶。向第三阶的过渡正在发生——智能体编写自己的技能、构建自己的上下文、发现自己的能力。第四阶是自举螺旋：被测试套件支撑、通过上下文积累、通过基底协调的递归自我改进。

左脚踩右脚。地面稳固。螺旋上升。

### 参考资料

- [人类带宽的尽头，第一篇](/posts/end-of-human-bandwidth)——关于补偿结构与范式翻转
- [上下文协议，第二篇](/posts/the-context-protocol)——关于上下文基础设施与四个操作
- [Ralph Wiggum 循环](/posts/ralph-wiggum-loop-claude-code.html)——关于智能体在循环中自主运行
- [OpenClaw - Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)——196K star，智能体驱动开发
- 痕迹协作 (Stigmergy)——[Wikipedia](https://en.wikipedia.org/wiki/Stigmergy)，通过共享环境的间接协调

</div>