---
title: "AI Agents and the New Tool Paradigm: Code as the Universal Interface"
date: 2025-08-07
excerpt: On knowledge alignment, context engineering, HITL limitations, and why code is becoming the universal tool for machine intelligence.
---

<div class="lang-en">

Some scattered thoughts on where AI agents are heading - covering knowledge transfer, context engineering, alignment, confidence, evaluation, and why code is becoming the universal tool for machine intelligence.

## Knowledge and Alignment

In human society, knowledge is transmitted across generations primarily through education and self-directed learning. New knowledge continuously emerges from social production activities and lived experience.

For AI systems, alignment is the analogous challenge: how do we ensure the knowledge and behaviors of these systems match human intentions and values? The parallel is striking - both processes involve transferring understanding from one entity to another, with all the loss and distortion that implies.

## Context Engineering and Context Windows

In the short term, context engineering matters. Techniques for structuring prompts, managing conversation history, and strategically loading relevant information into context all provide meaningful improvements.

In the long term, all context-engineering tricks will be replaced by native large context windows. As models scale to millions of tokens of context, the elaborate scaffolding we build today becomes unnecessary. The tricks become native capabilities.

This is a recurring pattern in AI: today's hacks become tomorrow's baseline features.

## Delegation and Result Alignment

The core challenge of AI agents is aligning outputs with user expectations. How do we close this gap?

**Direct result alignment:**

- Integration testing with users
- Generating demos and simulations
- Producing Figma mocks before code
- Visual previews of intended behavior

There's an interesting relationship between requirement certainty and code stability:

- **More certain requirements** → more fixed, stable code
- **Less certain requirements** → more flexible, exploratory code

The implication: invest heavily in requirement clarity before touching code. The cost of alignment errors compounds.

## Confidence

First, let's be clear: there are many paths to solving any problem. No solution is absolutely correct. Different approaches have their own trade-offs.

How do we ensure humans have confidence in AI-generated results?

1. **Logical self-consistency**: The solution should be internally coherent
2. **Explainability**: The reasoning should be traceable and understandable
3. **Confident laziness**: Humans should be able to trust the output enough to not verify every detail

The goal isn't to eliminate human oversight - it's to make that oversight efficient and targeted.

## Evaluation and Feedback

**A contrarian view: reduce Human-in-the-Loop (HITL).**

HITL helps preserve human participation and decision-making in automated systems. But honestly, it's often a lazy approach.

Humans are the least efficient, most error-prone component in any automated system. Humans are an extremely lazy species - minimizing thought and action conserves energy, a legacy of natural evolution. Compared to LLMs, human brains don't necessarily have lower error rates.

The future isn't more human checkpoints. It's better automated verification that only escalates to humans when genuinely necessary.

## The Tool Paradigm Shift

Humans have been defined as intelligent since we learned to use fire. The external distinction between intelligent and non-intelligent beings is the ability to use tools.

By this definition, we must acknowledge that current LLMs can already use tools effectively. They are genuine intelligent agents.

In an intelligent society, agents can modify objective reality through tool use. The quality of available tools significantly determines what's achievable.

## Code as the Universal Tool

What is code?

Code is humanity's tool for controlling computers. From binary punch cards, to assembly, to high-level languages - humans use code to give computers specific instructions, making them work according to human expectations.

**Today, we must change the subject of that sentence.**

Code is the universal tool for LLM intelligence to control computers.

Because most high-level programming languages are Turing-complete, LLM agents can theoretically write arbitrary code as their tool for controlling computers, the internet, and even physical devices.

This is one of the key discoveries for dramatically improving LLM capabilities: give them the ability to write and execute code, and they gain access to the entire digital world.

The implications are profound:

- Every API becomes accessible
- Every automation becomes possible
- Every digital system becomes controllable
- The boundary between "what the AI knows" and "what the AI can do" dissolves

Code isn't just a tool for building software anymore. It's the universal interface through which machine intelligence interacts with and reshapes the digital world.

</div>

<div class="lang-zh">

关于 AI 智能体发展方向的一些零散思考——涵盖知识传递、上下文工程、对齐、置信度、评估，以及为什么代码正在成为机器智能的通用工具。

## 知识与对齐

在人类社会中，知识主要通过教育和自主学习跨代传递。新知识不断从社会生产活动和生活经验中涌现。

对于 AI 系统，对齐是类似的挑战：我们如何确保这些系统的知识和行为符合人类的意图和价值观？这种相似性很惊人——两个过程都涉及将理解从一个实体传递到另一个实体，伴随着所有可能的损失和扭曲。

## 上下文工程与上下文窗口

短期内，上下文工程很重要。结构化提示词、管理对话历史、策略性地将相关信息加载到上下文中——这些技术都能带来显著改进。

长期来看，所有上下文工程技巧都将被原生的大上下文窗口取代。当模型扩展到数百万 token 的上下文时，我们今天构建的精巧脚手架将变得不必要。技巧变成原生能力。

这是 AI 中的一个反复出现的模式：今天的 hack 成为明天的基线功能。

## 委托与结果对齐

AI 智能体的核心挑战是让输出与用户期望对齐。我们如何缩小这个差距？

**直接结果对齐：**

- 与用户进行集成测试
- 生成演示和模拟
- 在编码前生成 Figma 原型
- 预期行为的可视化预览

需求确定性和代码稳定性之间存在有趣的关系：

- **需求越确定** → 代码越固定、越稳定
- **需求越不确定** → 代码越灵活、越具探索性

启示：在动代码之前，大力投入需求澄清。对齐错误的成本会复利累积。

## 置信度

首先，让我们明确：解决任何问题都有多种路径。没有绝对正确的解决方案。不同的方法有各自的权衡。

我们如何确保人类对 AI 生成的结果有信心？

1. **逻辑自洽**：解决方案应该内部一致
2. **可解释性**：推理应该可追溯、可理解
3. **自信的懒惰**：人类应该能够足够信任输出，而不必验证每个细节

目标不是消除人类监督——而是让监督高效且有针对性。

## 评估与反馈

**一个逆向观点：减少人在回路（HITL）。**

HITL 有助于在自动化系统中保留人类参与和决策。但老实说，这通常是一种懒惰的方法。

人类是任何自动化系统中效率最低、最容易出错的组件。人类是一个极其懒惰的物种——最小化思考和行动以节省能量，这是自然进化的遗产。与 LLM 相比，人脑不一定有更低的错误率。

未来不是更多的人类检查点。而是更好的自动化验证，只在真正必要时才升级给人类。

## 工具范式转变

自从我们学会使用火以来，人类就被定义为智能的。智能与非智能生物之间的外部区别是使用工具的能力。

按照这个定义，我们必须承认当前的 LLM 已经能够有效使用工具。它们是真正的智能代理。

在智能社会中，代理可以通过使用工具来改变客观现实。可用工具的质量在很大程度上决定了可以实现什么。

## 代码作为通用工具

什么是代码？

代码是人类控制计算机的工具。从二进制打孔卡到汇编语言，再到高级语言——人类使用代码向计算机发出具体指令，使其按照人类的期望工作。

**今天，我们必须改变这句话的主语。**

代码是 LLM 智能控制计算机的通用工具。

因为大多数高级编程语言都是图灵完备的，LLM 智能体理论上可以编写任意代码作为控制计算机、互联网甚至物理设备的工具。

这是大幅提升 LLM 能力的关键发现之一：赋予它们编写和执行代码的能力，它们就能访问整个数字世界。

影响是深远的：

- 每个 API 都变得可访问
- 每种自动化都变得可能
- 每个数字系统都变得可控
- "AI 知道什么"和"AI 能做什么"之间的界限消融

代码不再仅仅是构建软件的工具。它是机器智能与数字世界交互并重塑数字世界的通用接口。

</div>
