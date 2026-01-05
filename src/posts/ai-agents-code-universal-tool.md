---
title: "AI Agents and the New Tool Paradigm: Code as the Universal Interface"
date: 2025-08-07
excerpt: On knowledge alignment, context engineering, HITL limitations, and why code is becoming the universal tool for machine intelligence.
---

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
