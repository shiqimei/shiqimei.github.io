---
title: "Claude Code for Data Analysis: Large Datasets as Codebases is All You Need"
date: 2026-01-18
excerpt: How to use Claude Code for enterprise data analysis by transforming the problem into codebase file editing. Covers embeddings + clustering limitations, the IR workflow pattern, parallel Task agents, and report validation to prevent hallucinations.
---

<img src="../images/claude-code-data-analysis-pipeline.svg" class="post-hero">

<div class="lang-en">

Working with large datasets (100K-1M records) for consulting and analysis presents unique challenges. Traditional approaches often fall short when you need to extract the top 100 themes, generate insights, and produce enterprise-quality reports.

This post documents our approach using Claude Code for a real enterprise project: generating biweekly media monitoring reports from 25,000+ news articles across global markets.

## The Problem: Large-Scale Data Analysis

The core challenge: given a massive dataset, how do you:

1. Identify the top themes and topics
2. Deduplicate similar content
3. Categorize and rank by business relevance
4. Generate summaries without hallucinations
5. Produce formatted reports (Excel, PDF)

Three approaches exist. Two don't work well. One does.

## Approach 1: Embeddings + Clustering

The traditional machine learning approach:

1. Generate semantic embeddings (e.g., Qwen3-Embedding-0.6B)
2. Run density-based clustering (HDBSCAN)
3. Recursively sub-cluster until manageable sizes
4. Use small models for cluster summaries

</div>

<div class="lang-zh">

处理大规模数据集（10万-100万条记录）进行咨询和分析面临独特挑战。当你需要提取前100个主题、生成洞察并产出企业级报告时，传统方法往往力不从心。

本文记录了我们使用 Claude Code 完成一个真实企业项目的方法：从全球市场的2.5万多篇新闻文章中生成双周舆情监测报告。

## 问题：大规模数据分析

核心挑战：给定一个海量数据集，如何：

1. 识别顶级主题和话题
2. 对相似内容去重
3. 按业务相关性分类和排序
4. 生成摘要且不产生幻觉
5. 产出格式化报告（Excel、PDF）

存在三种方法。两种效果不佳。一种有效。

## 方法一：嵌入向量 + 聚类

传统的机器学习方法：

1. 生成语义嵌入向量（如 Qwen3-Embedding-0.6B）
2. 运行基于密度的聚类（HDBSCAN）
3. 递归子聚类直到可管理的规模
4. 使用小模型生成簇摘要

</div>

```
Raw JSON Data (25K articles)
    ↓ [Qwen3-Embedding-0.6B, 1024 dims]
Embedding Vectors
    ↓ [HDBSCAN, conservative params]
L1 Clusters (30-150 clusters)
    ↓ [Recursive if > 10K tokens]
L2/L3 Sub-clusters
    ↓ [Qwen3-30B summaries]
Cluster Summaries
```

<div class="lang-en">

**Why it fails:** News data is sparse, not dense. HDBSCAN works well when data naturally forms clusters. But news articles cover diverse topics with weak semantic connections.

Results:
- 50%+ articles remain unclustered
- Aggressive parameters create too many micro-clusters
- Even optimized, 30%+ unclustered records persist

When data is sparse, clustering doesn't work.

## Approach 2: Large Context LLMs

Modern LLMs have massive context windows:
- Claude Opus 4.5: 200K tokens
- Gemini 3 Pro: 1M tokens

Strategies to fit large datasets:

1. **Sampling**: Take 10% of data to fit within context
2. **Chunking**: Split into multiple sub-datasets, process separately

</div>

<div class="lang-zh">

**失败原因：** 新闻数据是稀疏的，而非稠密的。HDBSCAN 在数据自然形成簇时效果好。但新闻文章涵盖多样主题，语义关联较弱。

结果：
- 50%以上的文章无法聚类
- 激进的参数会创建太多微型簇
- 即使优化后，仍有30%以上的记录无法归类

当数据稀疏时，聚类不起作用。

## 方法二：大上下文 LLM

现代 LLM 拥有巨大的上下文窗口：
- Claude Opus 4.5：20万 token
- Gemini 3 Pro：100万 token

容纳大数据集的策略：

1. **采样**：取10%的数据以适应上下文
2. **分块**：拆分成多个子数据集，分别处理

</div>

<div class="lang-en">

**Why it fails:** Hallucination compounds with context length.

As token consumption grows, the model's attention to facts weakens. Errors accumulate:
- Dates shift
- Numbers drift
- Sources get confused
- Fabricated details appear

Large context is necessary but insufficient. You need verification mechanisms.

## Approach 3: Treat It as Codebase File Editing

This is the key insight: **coding agents like Claude Code are optimized for file operations.**

Claude Code has:
- `Read` tool optimized for files up to 2000 lines
- `Edit` tool for surgical changes
- `Write` tool for file creation
- `Bash` for unix commands
- Familiar filesystem navigation

The reframe: convert your dataset problem into a codebase problem.

</div>

<div class="lang-zh">

**失败原因：** 幻觉随上下文长度累积。

随着 token 消耗增长，模型对事实的注意力减弱。错误不断累积：
- 日期偏移
- 数字漂移
- 来源混淆
- 虚构细节出现

大上下文是必要的，但不充分。你需要验证机制。

## 方法三：当作代码库文件编辑问题处理

这是关键洞察：**像 Claude Code 这样的编程智能体针对文件操作做了优化。**

Claude Code 拥有：
- `Read` 工具，针对2000行以内的文件优化
- `Edit` 工具用于精确修改
- `Write` 工具用于文件创建
- `Bash` 用于 unix 命令
- 熟悉的文件系统导航

重新定义问题：将数据集问题转换为代码库问题。

</div>

```
Excel/JSON Data
    ↓ [Preprocessing scripts]
CSV Files (row-based, compact format)
    ↓ [Split into chunks]
200 lines per file × N files
    ↓ [Claude Code operates on files]
Tagged/Labeled/Merged CSV Files
```

<div class="lang-en">

### The Conversion

1. **Dump data to CSV**: Export from Excel/JSON to row-based CSV
2. **Preprocess**: Remove whitespace, normalize to compact format
3. **Chunk**: Split into files of ~200 records each (fits in 2000 lines)
4. **Treat as code**: Now working with CSV files is like working with source code

A 200K record dataset becomes ~1000 CSV files. This is normal codebase size. Claude Code handles this naturally.

### Example: Labeling at Scale

</div>

<div class="lang-zh">

### 转换方法

1. **导出为 CSV**：从 Excel/JSON 导出为行式 CSV
2. **预处理**：移除空白，规范化为紧凑格式
3. **分块**：拆分成每个约200条记录的文件（适配2000行限制）
4. **当作代码**：现在操作 CSV 文件就像操作源代码

一个20万条记录的数据集变成约1000个 CSV 文件。这是正常的代码库规模。Claude Code 自然地处理这些。

### 示例：大规模标注

</div>

```diff
- Column A|Column B|...
+ Tag1,Tag2,Tag3|Column A|Column B|...
```

<div class="lang-en">

Claude Code edits each CSV file, adding classification tags to each row. The operation is familiar - it's just file editing.

## Parallel Task Agents

Claude Code can run up to 10 Task agents simultaneously. For labeling tasks, assign one agent per CSV chunk:

</div>

<div class="lang-zh">

Claude Code 编辑每个 CSV 文件，为每行添加分类标签。这个操作很熟悉——只是文件编辑而已。

## 并行 Task 智能体

Claude Code 可以同时运行最多10个 Task 智能体。对于标注任务，为每个 CSV 块分配一个智能体：

</div>

```
Running 10 Task agents... (ctrl+o to expand)
   ├─ Tag batch 1 summaries · 12 tool uses
   │  ⎿  Processing summary_01.csv...
   ├─ Tag batch 2 summaries · 8 tool uses
   │  ⎿  Processing summary_02.csv...
   ├─ Tag batch 3 summaries · 15 tool uses
   │  ⎿  Processing summary_03.csv...
   ├─ Tag batch 4 summaries · 11 tool uses
   │  ⎿  Processing summary_04.csv...
   ├─ Tag batch 5 summaries · 9 tool uses
   │  ⎿  Processing summary_05.csv...
   ├─ Tag batch 6 summaries · 14 tool uses
   │  ⎿  Processing summary_06.csv...
   ├─ Tag batch 7 summaries · 7 tool uses
   │  ⎿  Processing summary_07.csv...
   ├─ Tag batch 8 summaries · 13 tool uses
   │  ⎿  Processing summary_08.csv...
   ├─ Tag batch 9 summaries · 10 tool uses
   │  ⎿  Processing summary_09.csv...
   └─ Tag batch 10 summaries · 6 tool uses
      ⎿  Processing summary_10.csv...
```

<div class="lang-en">

This is 10x parallelism for data processing tasks. The Task tool is one of Claude Code's most powerful features for consulting work.

## The IR Workflow Pattern

IR = Intermediate Representation. This is the key architectural pattern for reliable report generation.

</div>

<div class="lang-zh">

这是数据处理任务的10倍并行度。Task 工具是 Claude Code 在咨询工作中最强大的功能之一。

## IR 工作流模式

IR = 中间表示。这是可靠报告生成的关键架构模式。

</div>

```
Raw CSV Data
    ↓ [Labeling, merging, re-ranking, scoring]
PostgreSQL Database (with tags)
    ↓ [Query and filter]
IR (Intermediate Representation - JSON)
    ↓ [Normalization Task agents]
Normalized IR (deduplicated, translated)
    ↓ [Report generation scripts]
Final Reports (Markdown → XLSX/PPT/PDF)
```

<div class="lang-en">

### Why IR Matters

IR provides a checkpoint between data processing and report generation:

1. **Auditable**: IR files can be inspected before final output
2. **Iterative**: Regenerate reports without reprocessing data
3. **Verifiable**: Facts in reports can be traced back to IR

### Two-Phase IR Generation

**Phase 1: Raw IR**
- Query database with tag and source filters
- Output JSON with candidate articles

**Phase 2: Normalized IR**
- Task agents merge duplicate topics
- Add translations (multilingual support)
- Normalize date formats (YYYY-MM-DD)
- Validate and enrich metadata

This separation prevents errors from propagating into final reports.

## Report Validation: Preventing Hallucinations

The critical innovation: **validate every fact in the report has a source reference.**

</div>

<div class="lang-zh">

### 为什么 IR 重要

IR 在数据处理和报告生成之间提供了一个检查点：

1. **可审计**：IR 文件可以在最终输出前检查
2. **可迭代**：无需重新处理数据即可重新生成报告
3. **可验证**：报告中的事实可以追溯到 IR

### 两阶段 IR 生成

**第一阶段：原始 IR**
- 使用标签和来源过滤器查询数据库
- 输出包含候选文章的 JSON

**第二阶段：规范化 IR**
- Task 智能体合并重复主题
- 添加翻译（多语言支持）
- 规范化日期格式（YYYY-MM-DD）
- 验证和丰富元数据

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

### report-validator Skill

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

## Agent Skills：封装专业知识

Claude Code Skills 是封装领域专业知识的可复用指令集。

</div>

```
.claude/skills/
├── generate-report/     # Two-phase IR → Report workflow
├── tag-summaries/       # Multi-tag classification
├── report-validator/    # Fact verification
├── xlsx/                # Excel generation with formulas
└── analyze-cluster/     # Cluster metadata extraction
```

<div class="lang-en">

### Key Skills for Data Analysis

**generate-report**: Orchestrates the full pipeline
- Phase 0: Database deduplication
- Phase 1: Raw IR generation
- Phase 2: IR normalization
- Phase 3: Markdown generation
- Phase 4: Excel export

**tag-summaries**: Multi-label classification
- Primary tags: market policy, opportunity, company news, competitor, industry
- Secondary tags: negative sentiment categories
- Social media tags: platform-specific variants

**xlsx**: Enterprise Excel generation
- Formula preservation (never hardcode calculated values)
- Error checking (zero #REF!, #DIV/0!, etc.)
- Professional styling (column widths, alignment, wrapping)

## The Complete Architecture

</div>

<div class="lang-zh">

### 数据分析的关键 Skills

**generate-report**：编排完整流程
- 第0阶段：数据库去重
- 第1阶段：原始 IR 生成
- 第2阶段：IR 规范化
- 第3阶段：Markdown 生成
- 第4阶段：Excel 导出

**tag-summaries**：多标签分类
- 主标签：市场政策、市场机会、公司新闻、竞品、行业
- 次标签：负面情绪分类
- 社媒标签：平台特定变体

**xlsx**：企业级 Excel 生成
- 公式保留（永不硬编码计算值）
- 错误检查（零 #REF!、#DIV/0! 等）
- 专业样式（列宽、对齐、自动换行）

## 完整架构

</div>

<img src="../images/claude-code-data-analysis-architecture.svg" style="width:100%;max-width:700px;margin:1.5rem auto;display:block;">

<div class="lang-en">

## Key Takeaways

1. **Reframe the problem**: Data analysis becomes codebase file editing. Claude Code is optimized for this.

2. **Chunk strategically**: 200 records per file, 2000 lines max. Fits Claude Code's tools perfectly.

3. **Parallelize with Task agents**: 10x throughput for labeling, classification, and validation.

4. **Use IR as checkpoint**: Separate data processing from report generation. Enables iteration and auditing.

5. **Validate everything**: The report-validator pattern catches hallucinations before delivery.

6. **Encapsulate in skills**: Domain expertise becomes reusable, maintainable instruction sets.

The result: enterprise-quality reports from 25K+ articles, with every fact traceable to source data.

Claude Code isn't just for writing code. It's a general-purpose agent for any task that can be expressed as file operations. Data analysis is a perfect fit.

</div>

<div class="lang-zh">

## 关键要点

1. **重新定义问题**：数据分析 → 代码库文件编辑。Claude Code 针对此做了优化。

2. **策略性分块**：每文件200条记录，最多2000行。适配 Claude Code 的工具。

3. **用 Task 智能体并行化**：标注、分类、验证获得10倍吞吐量。

4. **使用 IR 作为检查点**：分离数据处理和报告生成。支持迭代和审计。

5. **验证一切**：report-validator 模式在交付前捕获幻觉。

6. **封装为 Skills**：领域专业知识变成可复用、可维护的指令集。

结果：从2.5万多篇文章生成企业级报告，每个事实都可追溯到源数据。

Claude Code 不只是写代码。它是通用智能体，适用于任何可以表达为文件操作的任务。数据分析完美契合。

</div>
