---
title: "Claude Code for Consulting & Data Analysis: Treating Large Datasets as Codebases"
date: 2026-01-18
excerpt: How to use Claude Code for enterprise data analysis by transforming the problem into codebase file editing. Covers embeddings + clustering limitations, the IR workflow pattern, parallel Task agents, and report validation to prevent hallucinations.
---

<img src="../images/claude-code-data-analysis-pipeline.svg" class="post-hero">

<div class="lang-en">

Working with large datasets (100K-1M records) for consulting is hard. You need to extract top themes, deduplicate content, categorize by business relevance, and generate reports without hallucinations.

This post documents our approach using Claude Code for a real enterprise project: generating biweekly media monitoring reports from 25,000+ news articles.

Three approaches exist. Two don't work. One does.

## Approach 1: Embeddings + Clustering

The traditional ML approach:

1. Generate semantic embeddings (Qwen3-Embedding-0.6B)
2. Run density-based clustering (HDBSCAN)
3. Recursively sub-cluster until manageable sizes
4. Use small models for cluster summaries

**Why it fails:** News data is sparse, not dense. HDBSCAN works when data naturally forms clusters. News articles cover diverse topics with weak semantic connections.

Results:
- 50%+ articles remain unclustered
- Aggressive parameters create too many micro-clusters
- Even optimized, 30%+ records can't be classified

When data is sparse, clustering doesn't work.

## Approach 2: Large Context LLMs

Modern LLMs have massive context windows:
- Claude Opus 4.5: 200K tokens
- Gemini 2.5 Pro: 1M tokens

Strategies to fit large datasets:
- **Sampling**: Take 10% of data to fit within context
- **Chunking**: Split into multiple sub-datasets, process separately

**Why it fails:** Hallucination compounds with context length.

As token consumption grows, model attention to facts weakens. Errors accumulate: dates shift, numbers drift, sources get confused, fabricated details appear.

Large context is necessary but insufficient. You need verification mechanisms.

## Approach 3: Treat It as Codebase File Editing

This is the key insight: **coding agents like Claude Code are optimized for file operations.**

Claude Code has:
- `Read` tool optimized for files up to 2000 lines
- `Edit` tool for surgical changes
- `Write` tool for file creation
- `Bash` for unix commands

The reframe: convert your dataset problem into a codebase problem.

### The Conversion

1. **Dump data to CSV**: Export from Excel/JSON to row-based CSV
2. **Preprocess**: Remove whitespace, normalize to compact format
3. **Chunk**: Split into files of ~200 records each (fits in 2000 lines)
4. **Treat as code**: Working with CSV files = working with source code

A 200K record dataset becomes ~1000 CSV files. Normal codebase size. Claude Code handles this naturally.

### Labeling at Scale

</div>

<div class="lang-zh">

处理大规模数据集（10万-100万条记录）做咨询很难。你需要提取顶级主题、去重内容、按业务相关性分类，并生成无幻觉的报告。

本文记录了我们使用 Claude Code 完成一个真实企业项目的方法：从2.5万多篇新闻文章生成双周舆情监测报告。

三种方法。两种不行。一种有效。

## 方法一：嵌入向量 + 聚类

传统机器学习方法：

1. 生成语义嵌入向量（Qwen3-Embedding-0.6B）
2. 运行基于密度的聚类（HDBSCAN）
3. 递归子聚类直到可管理的规模
4. 使用小模型生成簇摘要

**失败原因：** 新闻数据是稀疏的，不是稠密的。HDBSCAN 在数据自然形成簇时有效。新闻文章涵盖多样主题，语义关联弱。

结果：
- 50%以上文章无法聚类
- 激进参数创建太多微型簇
- 即使优化，仍有30%以上记录无法分类

数据稀疏时，聚类不起作用。

## 方法二：大上下文 LLM

现代 LLM 拥有巨大上下文窗口：
- Claude Opus 4.5：20万 tokens
- Gemini 2.5 Pro：100万 tokens

容纳大数据集的策略：
- **采样**：取10%数据适应上下文
- **分块**：拆分成多个子数据集，分别处理

**失败原因：** 幻觉随上下文长度累积。

随着 token 消耗增长，模型对事实的注意力减弱。错误累积：日期偏移、数字漂移、来源混淆、虚构细节出现。

大上下文是必要的，但不充分。需要验证机制。

## 方法三：当作代码库文件编辑

这是关键洞察：**像 Claude Code 这样的编程智能体针对文件操作做了优化。**

Claude Code 拥有：
- `Read` 工具，针对2000行以内的文件优化
- `Edit` 工具用于精确修改
- `Write` 工具用于文件创建
- `Bash` 用于 unix 命令

重新定义：把数据集问题转换成代码库问题。

### 转换方法

1. **导出为 CSV**：从 Excel/JSON 导出为行式 CSV
2. **预处理**：移除空白，规范化为紧凑格式
3. **分块**：每个文件约200条记录（适配2000行）
4. **当作代码**：操作 CSV 文件 = 操作源代码

20万条记录的数据集变成约1000个 CSV 文件。正常代码库规模。Claude Code 自然地处理。

### 大规模标注

</div>

```diff
- Column A|Column B|...
+ Tag1,Tag2,Tag3|Column A|Column B|...
```

<div class="lang-en">

Claude Code edits each CSV file, adding classification tags to each row. The operation is familiar - just file editing.

## Parallel Task Agents

Claude Code runs up to 10 Task agents simultaneously. For labeling tasks, assign one agent per CSV chunk:

</div>

<div class="lang-zh">

Claude Code 编辑每个 CSV 文件，为每行添加分类标签。操作很熟悉——就是文件编辑。

## 并行 Task 智能体

Claude Code 可同时运行最多10个 Task 智能体。标注任务中，为每个 CSV 块分配一个智能体：

</div>

```
Running 10 Task agents... (ctrl+o to expand)
   ├─ Tag batch 1 · Processing summary_01.csv...
   ├─ Tag batch 2 · Processing summary_02.csv...
   ├─ Tag batch 3 · Processing summary_03.csv...
   ...
   └─ Tag batch 10 · Processing summary_10.csv...
```

<div class="lang-en">

10x parallelism for data processing. The Task tool is Claude Code's most powerful feature for consulting work.

## The IR Workflow Pattern

IR = Intermediate Representation. Key architectural pattern for reliable report generation.

</div>

<div class="lang-zh">

数据处理获得10倍并行度。Task 工具是 Claude Code 在咨询工作中最强大的功能。

## IR 工作流模式

IR = 中间表示。可靠报告生成的关键架构模式。

</div>

```
Raw CSV Data
    ↓ [Labeling, merging, re-ranking, scoring]
PostgreSQL Database (with tags)
    ↓ [Query and filter]
IR (Intermediate Representation - JSON)
    ↓ [Normalization via Task agents]
Normalized IR (deduplicated, translated)
    ↓ [Report generation scripts]
Final Reports (Markdown → XLSX/PDF)
```

<div class="lang-en">

### Why IR Matters

IR provides a checkpoint between data processing and report generation:

1. **Auditable**: IR files can be inspected before final output
2. **Iterative**: Regenerate reports without reprocessing data
3. **Verifiable**: Facts in reports trace back to IR

### Two-Phase IR Generation

**Phase 1: Raw IR**
- Query database with tag and source filters
- Output JSON with candidate articles

**Phase 2: Normalized IR**
- Task agents merge duplicate topics
- Add translations (multilingual support)
- Normalize date formats (YYYY-MM-DD)

This separation prevents errors from propagating into final reports.

## Report Validation: Preventing Hallucinations

The critical innovation: **validate every fact in the report has a source reference.**

</div>

<div class="lang-zh">

### 为什么 IR 重要

IR 在数据处理和报告生成之间提供检查点：

1. **可审计**：最终输出前可检查 IR 文件
2. **可迭代**：无需重新处理数据即可重新生成报告
3. **可验证**：报告中的事实可追溯到 IR

### 两阶段 IR 生成

**第一阶段：原始 IR**
- 使用标签和来源过滤器查询数据库
- 输出包含候选文章的 JSON

**第二阶段：规范化 IR**
- Task 智能体合并重复主题
- 添加翻译（多语言支持）
- 规范化日期格式（YYYY-MM-DD）

这种分离防止错误传播到最终报告。

## 报告验证：防止幻觉

关键创新：**验证报告中的每个事实都有来源引用。**

</div>

```
Report Markdown
    ↓ [Extract facts script]
.validation.json (dates, numbers, claims)
    ↓ [Parallel Task agents search sources]
Source references added
    ↓ [Verification script]
Check for NOT_FOUND entries
```

<div class="lang-en">

### The report-validator Skill

A 3-step workflow:

1. **Extract Facts**: Script parses markdown, extracts dates/numbers into `.validation.json`
2. **Fill Sources**: Task agents search IR and dataset files in parallel
3. **Check Results**: Script verifies no facts marked `"NOT_FOUND"`

### Smart Matching

The validator handles format variations:

- **Dates**: "2026-01-07", "2026/01/07", "January 7", "1月7日"
- **Numbers**: "1.8B" = "18亿" = "1.8 billion"

Core numeric values must exist in source, even in different formats.

### Zero Tolerance

If ANY fact lacks a source reference, the report fails validation. This forces:

- Accurate transcription from sources
- No invented details
- Traceable claims

## Agent Skills: Encapsulating Expertise

Claude Code skills are reusable instruction sets that encapsulate domain expertise.

</div>

<div class="lang-zh">

### report-validator 技能

3步工作流：

1. **提取事实**：脚本解析 markdown，将日期/数字提取到 `.validation.json`
2. **填充来源**：Task 智能体并行搜索 IR 和数据集文件
3. **检查结果**：脚本验证没有标记为 `"NOT_FOUND"` 的事实

### 智能匹配

验证器处理格式变体：

- **日期**："2026-01-07"、"2026/01/07"、"January 7"、"1月7日"
- **数字**："1.8B" = "18亿" = "1.8 billion"

核心数值必须存在于来源中，即使格式不同。

### 零容忍

如果任何事实缺少来源引用，报告验证失败。这强制：

- 从来源准确转录
- 不添加虚构细节
- 声明可追溯

## Agent 技能：封装专业知识

Claude Code 技能是封装领域专业知识的可复用指令集。

</div>

```
.claude/skills/
├── generate-report/     # Two-phase IR → Report workflow
├── tag-summaries/       # Multi-tag classification
├── report-validator/    # Fact verification
└── xlsx/                # Excel generation with formulas
```

<div class="lang-en">

### Key Skills for Data Analysis

| Skill | Purpose |
|-------|---------|
| `generate-report` | Orchestrates full pipeline: dedup → IR → normalize → markdown → Excel |
| `tag-summaries` | Multi-label classification with primary/secondary/social tags |
| `report-validator` | Extracts facts, searches sources, verifies coverage |
| `xlsx` | Enterprise Excel with formulas, error checking, styling |

## Key Takeaways

1. **Reframe the problem**: Data analysis → codebase file editing. Claude Code is optimized for this.

2. **Chunk strategically**: 200 records per file, 2000 lines max. Fits Claude Code's tools.

3. **Parallelize with Task agents**: 10x throughput for labeling, classification, validation.

4. **Use IR as checkpoint**: Separate data processing from report generation. Enables iteration and auditing.

5. **Validate everything**: The report-validator pattern catches hallucinations before delivery.

6. **Encapsulate in skills**: Domain expertise becomes reusable, maintainable instruction sets.

The result: enterprise-quality reports from 25K+ articles, with every fact traceable to source data.

Claude Code isn't just for writing code. It's a general-purpose agent for any task that can be expressed as file operations. Data analysis fits perfectly.

</div>

<div class="lang-zh">

### 数据分析的关键技能

| 技能 | 用途 |
|-----|------|
| `generate-report` | 编排完整流程：去重 → IR → 规范化 → markdown → Excel |
| `tag-summaries` | 带主/次/社媒标签的多标签分类 |
| `report-validator` | 提取事实、搜索来源、验证覆盖 |
| `xlsx` | 企业级 Excel，带公式、错误检查、样式 |

## 关键要点

1. **重新定义问题**：数据分析 → 代码库文件编辑。Claude Code 针对此做了优化。

2. **策略性分块**：每文件200条记录，最多2000行。适配 Claude Code 的工具。

3. **用 Task 智能体并行化**：标注、分类、验证获得10倍吞吐量。

4. **使用 IR 作为检查点**：分离数据处理和报告生成。支持迭代和审计。

5. **验证一切**：report-validator 模式在交付前捕获幻觉。

6. **封装为技能**：领域专业知识变成可复用、可维护的指令集。

结果：从2.5万多篇文章生成企业级报告，每个事实都可追溯到源数据。

Claude Code 不只是写代码。它是通用智能体，适用于任何可以表达为文件操作的任务。数据分析完美契合。

</div>
