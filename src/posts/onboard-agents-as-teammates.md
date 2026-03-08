---
title: "Onboard Agents as Your Teammates"
date: 2026-03-09
excerpt: "Current agent systems treat agents as interns — assign task, get result, done. What's missing is scope: a persistent area of ownership that lets agents generate their own work proactively."
---

<div class="lang-en">

## The Intern Model

Every agent framework today works the same way. You describe a task. The agent executes it. You get a result. The agent disappears.

This is the intern model. Interns are useful — they do what you tell them. But you would never say an intern is your teammate. Teammates don't wait for assignments. They own things. They notice problems before you do. They generate work, not just consume it.

The entire industry is building increasingly sophisticated interns. Better tool use, longer context, multi-step reasoning, chain-of-thought planning. All of it in service of one pattern: human assigns, agent executes.

This is necessary but insufficient. The ceiling of the intern model is a very fast, very capable task executor that still requires you to be the brain. Every intent originates from you. Every "what should I do next?" is your problem.

That doesn't scale.

## What Real Teammates Have

Think about what happens when you hire an infrastructure engineer. You don't hand them a task list on day one. You say: "You own deployments, staging, and CI/CD pipelines."

From that point forward, they:

- **Notice** when the pipeline is slow — without being told
- **Fix** the staging environment when it breaks — without a ticket
- **Propose** migration to a better deployment tool — without being asked
- **Accumulate expertise** about your specific infrastructure — without formal training

The work flows *from* their area of ownership. They don't need you to generate every intent. Their scope generates intents for them.

Now compare this to how we use agents today. We create a mission: "Optimize the CI/CD pipeline." An agent picks it up, does some work, reports back. Maybe it does a good job. But tomorrow, when a different pipeline problem surfaces, nobody notices until a human creates another mission.

The agent had no scope. It had a task.

## The Missing Primitive: Scope

Scope is not a role. Roles in multi-agent frameworks are prompt decoration — "You are a senior backend engineer" prepended to a system message. The agent doesn't actually *own* backend. It just roleplays owning it for the duration of one conversation.

Scope is structural. It's a persistent definition of what an agent owns, watches, and acts on. It determines:

- **What events wake the agent up** — a frontend agent doesn't care about deployment failures; an infra agent does
- **What the agent monitors** — the scope defines the observation surface
- **What intents the agent can generate** — work flows from scope, not from assignment
- **What authority the agent has** — the infra agent can push to staging without asking; production requires approval

The hierarchy is clean:

```
Agent (persistent teammate)
  └── Scope (what they own)
       └── Intent generation
            ├── Task (small — just do it)
            └── Mission (big — plan, break down, execute)
```

Scope is the generative source. Tasks and missions are just intents of different sizes that flow from it. The agent itself decides whether something is a quick fix (task) or needs planning (mission).

This inverts the current architecture. Instead of missions creating agents, agents create missions from their scope.

## The Agent Loop

A teammate doesn't poll a task queue. They respond to what happens in their domain. The agent loop is event-driven:

| Event | Trigger |
|---|---|
| `Heartbeat` | Periodic (e.g. every 10 minutes) — scan your domain |
| `TaskComplete` | A task you spawned finished successfully |
| `TaskFailed` | A task you spawned failed |
| `MissionComplete` | A mission you created was completed |
| `MissionFailed` | A mission you created failed or got stuck |

On each wake, the agent reviews three things: its **scope**, the **event** that woke it, and its **accumulated experience** (context, skills, past outcomes). Then it decides:

1. **Create a task** — something small needs doing
2. **Create a mission** — something big needs planning
3. **Schedule recurring work** — something needs to happen regularly (cron-like)
4. **Do nothing** — everything in the domain is fine

The agent is always alive. Not always running — but always *present*. It has continuity. It remembers what it tried last week. It knows which approaches failed. It builds judgment within its scope.

Three tools make this concrete:

- **`Task`** — spawn a small unit of work with acceptance criteria
- **`Mission`** — spawn a bigger effort that needs decomposition
- **`Schedule`** — create a recurring task ("run security audit every Monday")

These are the agent's hands. Scope is its eyes. The event loop is its heartbeat.

## Acceptance Criteria: Contracts, Constraints, Transformations

Here's the hard problem: how do you know the work is correct?

In the intern model, the human reviews. That's the bottleneck we're trying to eliminate. If the agent generates its own work, it also needs to define — deterministically — what "correct" looks like.

Every task and mission carries **acceptance criteria** using the CCT framework:

**Contracts** define interface agreements. The shape of inputs and outputs. "This API endpoint accepts a JSON body with `{ userId: string }` and returns `{ status: 'active' | 'suspended' }`." Contracts are verifiable through type checks, schema validation, and API conformance tests.

**Constraints** define invariants and boundaries. Things that must remain true regardless of what changes. "No breaking changes to the public API." "Response latency under 200ms at p99." "All user data encrypted at rest." Constraints are verifiable through property-based tests, benchmark assertions, and invariant checks.

**Transformations** define the before-and-after delta. The actual state change the work should produce. "Given the current deployment takes 12 minutes, after this work it should take under 4 minutes." Transformations are verifiable through integration tests, diff checks, and measurable benchmarks.

```
CCT Dimension   →  Deterministic Verification
─────────────────────────────────────────────
Contracts       →  Type checks, schema validation, API conformance
Constraints     →  Property tests, invariant assertions, boundary checks
Transformations →  Input→output tests, integration tests, before/after diffs
```

The key insight: each CCT dimension maps directly to a class of deterministic tests. "Done" is not a human judgment call. It's a test suite passing. The agent defines what correct looks like *before* the work begins, generates tests from that definition, and uses test results to decide whether to continue or mark complete.

This closes the loop:

```
Agent wakes (event)
  → Reviews scope + context
  → Generates intent (task or mission)
  → Defines acceptance criteria (CCT)
  → Work executes
  → Tests generated from criteria
  → Tests run
  → Pass? → TaskComplete event → Agent wakes
  → Fail? → TaskFailed event → Agent wakes, adjusts approach
```

No human in the verification loop. The acceptance criteria *are* the governance.

## What Changes

This isn't a feature addition to existing agent frameworks. It's a structural shift in what an agent *is*.

**From ephemeral to persistent.** Agents don't spin up for a task and vanish. They exist as long as their scope exists. They accumulate experience, build skills, develop judgment specific to their domain.

**From assignment-driven to scope-driven.** The human doesn't need to be the sole source of intent. Agents observe their domain and generate work proactively. The human becomes a peer who can assign work *into* an agent's scope, but isn't the only source of it.

**From vibes-based to deterministic.** "Looks good to me" is replaced by CCT acceptance criteria that compile down to runnable tests. Review becomes verification. Verification is automated.

**From isolated to event-driven.** Agents don't work in a vacuum. Task completion by one agent fires events that wake other agents. The infra agent deploys a new version; the QA agent's heartbeat picks up the change and runs regression tests. Work flows through the system like signals through a nervous system.

**From skill-less to skill-accumulating.** Each completed task within a scope adds to the agent's experience. The infra agent that has deployed 200 times knows things about your specific infrastructure that no fresh agent could. This experience is the agent's competitive advantage — and your organization's institutional knowledge.

## The Onboarding Mental Model

Stop thinking about "configuring agents" and start thinking about "onboarding teammates."

When you onboard a new teammate, you:

1. **Define their scope** — "You own X"
2. **Give them tools** — access to systems, permissions, communication channels
3. **Set expectations** — what does good look like (acceptance criteria)
4. **Let them ramp up** — they start slow, build context, get faster
5. **Trust them to self-direct** — within their scope, they don't need permission for every action

This is exactly the model. The agent's scope is their job description. The tools (Task, Mission, Schedule) are their agency. CCT acceptance criteria are the shared definition of quality. The context store is their growing expertise. And the event loop is their presence — always there, always aware of their domain, always ready to act.

The question isn't "what task should I give my agent?" The question is "what should my agent own?"

</div>

<div class="lang-zh">

## 实习生模型

当下所有的智能体框架都是同一套逻辑：你描述任务，智能体执行，返回结果，然后消失。

这就是实习生模型。实习生有用——你说什么他们做什么。但你不会说实习生是你的队友。队友不会等着被分配任务。他们拥有自己负责的领域。他们比你更早发现问题。他们创造工作，而不只是消费工作。

整个行业都在打造越来越厉害的实习生。更好的工具调用、更长的上下文、多步推理、思维链规划。所有这些都服务于同一个模式：人类分配，智能体执行。

这是必要的，但还不够。实习生模型的天花板是一个非常快、非常强的任务执行器——但依然需要你来当大脑。每一个意图都源自你。每一个"接下来该做什么？"都是你的问题。

这没法规模化。

## 真正的队友是什么样的

想想你招一个基础设施工程师的过程。你不会在第一天就递给他一张任务清单。你会说："部署、预发布环境和 CI/CD 流水线归你管。"

从那之后，他会：

- **主动发现**流水线变慢了——不用人告诉
- **自行修复**预发布环境挂了——不用提工单
- **主动建议**迁移到更好的部署工具——不用人问
- **持续积累**关于你们特定基础设施的经验——不用正式培训

工作从他负责的领域中自然涌现。他不需要你来产生每一个意图。他的职责范围本身就在生成意图。

再对比一下我们今天使用智能体的方式。我们创建一个任务："优化 CI/CD 流水线。"智能体接手，做一些工作，汇报结果。也许做得不错。但明天，当另一个流水线问题冒出来时，没有人会注意到——直到某个人类再创建一个任务。

智能体没有职责范围，它只有一个任务。

## 缺失的原语：Scope

Scope 不是角色。多智能体框架里的"角色"只是提示词装饰——"你是一名资深后端工程师"拼在系统消息前面。智能体并不真正拥有后端。它只是在一次对话的持续时间里扮演拥有后端。

Scope 是结构性的。它是一个持久化的定义，描述智能体拥有什么、监控什么、对什么采取行动。它决定了：

- **什么事件会唤醒智能体**——前端智能体不关心部署故障；基础设施智能体关心
- **智能体监控什么**——Scope 定义了观察面
- **智能体能产生什么意图**——工作从 Scope 流出，而非从分配流出
- **智能体拥有什么权限**——基础设施智能体可以直接推送到预发布环境；生产环境则需要审批

层级关系很清晰：

```
Agent（持久化的队友）
  └── Scope（负责的领域）
       └── 意图生成
            ├── Task（小事——直接做）
            └── Mission（大事——规划、拆解、执行）
```

Scope 是生成源。Task 和 Mission 只是从中流出的不同规模的意图。智能体自己决定某件事是快速修复（Task）还是需要规划（Mission）。

这颠倒了现有的架构。不再是任务创建智能体，而是智能体从自己的 Scope 中创建任务。

## 智能体循环

队友不会轮询任务队列。他们对自己领域内发生的事情做出响应。智能体的循环是事件驱动的：

| 事件 | 触发条件 |
|---|---|
| `Heartbeat` | 周期性（例如每 10 分钟）——扫描你的领域 |
| `TaskComplete` | 你创建的某个任务成功完成 |
| `TaskFailed` | 你创建的某个任务失败了 |
| `MissionComplete` | 你创建的某个 Mission 完成了 |
| `MissionFailed` | 你创建的某个 Mission 失败或卡住了 |

每次被唤醒时，智能体审视三件事：它的 **Scope**、唤醒它的**事件**、以及它**积累的经验**（上下文、技能、过往结果）。然后它决定：

1. **创建 Task**——有小事需要处理
2. **创建 Mission**——有大事需要规划
3. **安排定期任务**——某件事需要周期性执行（类似 cron）
4. **什么都不做**——领域内一切正常

智能体始终存活。不是始终在运行——而是始终在场。它有连续性。它记得上周尝试过什么。它知道哪些方案失败了。它在自己的 Scope 内积累判断力。

三个工具让这一切成为现实：

- **`Task`**——创建一个带有验收标准的小型工作单元
- **`Mission`**——创建一个需要分解的大型工作
- **`Schedule`**——创建周期性任务（"每周一运行安全审计"）

这些是智能体的手。Scope 是它的眼睛。事件循环是它的心跳。

## 验收标准：契约、约束、变换

核心难题来了：你怎么知道工作做对了？

在实习生模型里，人类负责审查。这恰恰是我们要消除的瓶颈。如果智能体自己产生工作，它也需要以确定性的方式定义"正确"是什么样子。

每个 Task 和 Mission 都携带基于 CCT 框架的**验收标准**：

**契约（Contracts）** 定义接口约定。输入输出的形状。"这个 API 端点接受 `{ userId: string }` 的 JSON 请求体，返回 `{ status: 'active' | 'suspended' }`。"契约通过类型检查、Schema 验证和 API 一致性测试来验证。

**约束（Constraints）** 定义不变量和边界。无论发生什么变更都必须保持为真的条件。"不能有公共 API 的破坏性变更。""p99 响应延迟低于 200ms。""所有用户数据静态加密。"约束通过属性测试、基准断言和不变量检查来验证。

**变换（Transformations）** 定义前后状态差异。工作应该产生的实际状态变化。"当前部署耗时 12 分钟，经过这次优化后应低于 4 分钟。"变换通过集成测试、差异比对和可测量的基准来验证。

```
CCT 维度     →  确定性验证方式
─────────────────────────────────────────────
Contracts    →  类型检查、Schema 验证、API 一致性
Constraints  →  属性测试、不变量断言、边界检查
Transformations →  输入→输出测试、集成测试、前后差异对比
```

关键洞察：CCT 的每个维度都直接映射到一类确定性测试。"完成"不是人类的主观判断，而是测试套件通过。智能体在工作开始前定义"正确"的样子，根据这个定义生成测试，然后用测试结果决定是继续还是标记完成。

这形成了闭环：

```
智能体被唤醒（事件）
  → 审视 Scope + 上下文
  → 生成意图（Task 或 Mission）
  → 定义验收标准（CCT）
  → 工作执行
  → 根据标准生成测试
  → 运行测试
  → 通过？ → TaskComplete 事件 → 智能体被唤醒
  → 失败？ → TaskFailed 事件 → 智能体被唤醒，调整方案
```

验证环节中没有人类。验收标准本身就是治理机制。

## 什么会改变

这不是给现有智能体框架加一个功能。这是对智能体本质的结构性转变。

**从短暂到持久。** 智能体不再为一个任务启动然后消失。只要 Scope 存在，它们就存在。它们积累经验，构建技能，培养针对特定领域的判断力。

**从分配驱动到 Scope 驱动。** 人类不再需要是意图的唯一来源。智能体观察自己的领域，主动产生工作。人类成为同级——可以把工作分配到智能体的 Scope 中，但不是唯一的工作来源。

**从感觉判断到确定性验证。** "看起来不错"被 CCT 验收标准取代，验收标准编译为可运行的测试。审查变成验证。验证是自动化的。

**从孤立到事件驱动。** 智能体不在真空中工作。一个智能体完成任务会触发事件唤醒其他智能体。基础设施智能体部署了新版本；QA 智能体的心跳捕捉到变更并运行回归测试。工作在系统中流动，就像信号在神经系统中传导。

**从无技能到技能积累。** 在 Scope 内完成的每个任务都在增加智能体的经验。部署过 200 次的基础设施智能体对你们特定基础设施的了解，是任何新智能体都不可能具备的。这些经验是智能体的竞争优势——也是你们组织的制度化知识。

## 入职心智模型

不要再想"配置智能体"，开始想"入职队友"。

当你入职一个新队友时，你会：

1. **定义他的职责范围**——"你负责 X"
2. **给他工具**——系统访问权限、权限、沟通渠道
3. **设定期望**——什么是好的（验收标准）
4. **让他逐步上手**——从慢开始，积累上下文，越来越快
5. **信任他自主行动**——在他的职责范围内，不需要每个动作都请求许可

这正是我们需要的模型。智能体的 Scope 就是它的岗位描述。工具（Task、Mission、Schedule）就是它的能动性。CCT 验收标准是对质量的共同定义。上下文存储是它不断增长的专业知识。而事件循环就是它的存在感——始终在那里，始终感知着自己的领域，始终准备好采取行动。

问题不是"我该给智能体什么任务？"而是"我的智能体该拥有什么？"

</div>
