---
title: "Claude Code for Consulting & Data Analysis: Treating Large Datasets as Codebases"
date: 2026-01-18
excerpt: How to use Claude Code for enterprise data analysis by transforming the problem into codebase file editing. Covers embeddings + clustering limitations, the IR workflow pattern, parallel Task agents, and report validation to prevent hallucinations.
---

<img src="../images/claude-code-data-analysis-pipeline.svg" class="post-hero">

<div class="lang-en">

Consulting with large datasets. 100K-1M records. Extract themes. Dedupe. Classify. Generate reports. No hallucinations.

This post: using Claude Code for enterprise data analysis. Real project. 25K+ news articles. Biweekly media monitoring reports.

## The Problem

Given a massive dataset, how do you:

1. Identify top themes
2. Deduplicate similar content
3. Classify by business relevance
4. Generate summaries without hallucinations
5. Output formatted reports (Excel, PDF)

Three approaches. Two fail. One works.

## Approach 1: Embeddings + Clustering

Traditional ML:

1. Generate embeddings (Qwen3-Embedding-0.6B)
2. Density-based clustering (HDBSCAN)
3. Recursive sub-clustering
4. Small models for summaries

</div>

<div class="lang-zh">

大规模数据集做咨询。10万-100万条记录。提取主题。去重。分类。生成报告。不能有幻觉。

本文：用 Claude Code 做企业数据分析。真实项目。2.5万多篇新闻。双周舆情监测报告。

## 问题

给定海量数据集，如何：

1. 识别顶级主题
2. 去重相似内容
3. 按业务相关性分类
4. 生成摘要不产生幻觉
5. 产出格式化报告（Excel、PDF）

三种方法。两种不行。一种有效。

## 方法一：嵌入向量 + 聚类

传统机器学习：

1. 生成嵌入向量（Qwen3-Embedding-0.6B）
2. 基于密度的聚类（HDBSCAN）
3. 递归子聚类
4. 小模型生成摘要

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

**Why it fails:** News data is sparse. Not dense. HDBSCAN needs natural clusters. News articles? Diverse topics. Weak semantic connections.

Results:
- 50%+ unclustered
- Aggressive params → micro-clusters
- Best case: 30%+ unclassified

Sparse data. Clustering fails.

## Approach 2: Large Context LLMs

Modern context windows:
- Claude Opus 4.5: 200K tokens
- Gemini 3 Pro: 1M tokens

Strategies:
- **Sampling**: 10% of data
- **Chunking**: Split and process separately

**Why it fails:** Hallucination compounds with context length.

More tokens → weaker attention to facts. Errors accumulate:
- Dates shift
- Numbers drift
- Sources confused
- Details fabricated

Large context: necessary but insufficient. Need verification.

## Approach 3: Codebase File Editing

Key insight: **coding agents are optimized for file operations.**

Claude Code tools:
- `Read`: up to 2000 lines
- `Edit`: surgical changes
- `Write`: file creation
- `Bash`: unix commands

Reframe: dataset problem → codebase problem.

</div>

<div class="lang-zh">

**失败原因：** 新闻数据是稀疏的。不是稠密的。HDBSCAN 需要自然聚簇。新闻文章？主题多样。语义关联弱。

结果：
- 50%以上无法聚类
- 激进参数 → 微型簇
- 最优情况：30%以上无法分类

数据稀疏。聚类失败。

## 方法二：大上下文 LLM

现代上下文窗口：
- Claude Opus 4.5：20万 tokens
- Gemini 3 Pro：100万 tokens

策略：
- **采样**：取10%数据
- **分块**：拆分后分别处理

**失败原因：** 幻觉随上下文长度累积。

更多 tokens → 事实注意力减弱。错误累积：
- 日期偏移
- 数字漂移
- 来源混淆
- 细节虚构

大上下文：必要但不充分。需要验证。

## 方法三：当作代码库文件编辑

关键洞察：**编程智能体针对文件操作优化。**

Claude Code 工具：
- `Read`：最多2000行
- `Edit`：精确修改
- `Write`：文件创建
- `Bash`：unix 命令

重新定义：数据集问题 → 代码库问题。

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

1. **Export to CSV**: Row-based format
2. **Preprocess**: Remove whitespace, compact
3. **Chunk**: ~200 records per file (fits 2000 lines)
4. **Treat as code**: CSV files = source code

200K records → ~1000 CSV files. Normal codebase. Claude Code handles it.

### Labeling at Scale

</div>

<div class="lang-zh">

### 转换方法

1. **导出 CSV**：行式格式
2. **预处理**：去空白，压缩
3. **分块**：每文件约200条（适配2000行）
4. **当作代码**：CSV 文件 = 源代码

20万条 → 约1000个 CSV。正常代码库。Claude Code 处理。

### 大规模标注

</div>

```diff
- Column A|Column B|...
+ Tag1,Tag2,Tag3|Column A|Column B|...
```

<div class="lang-en">

Claude Code edits CSV files. Adds tags to rows. Just file editing.

## Parallel Task Agents

10 agents. Simultaneously. One agent per CSV chunk:

</div>

<div class="lang-zh">

Claude Code 编辑 CSV。为行添加标签。就是文件编辑。

## 并行 Task 智能体

10个智能体。同时运行。每个 CSV 块一个智能体：

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

10x parallelism. Task tool: most powerful feature for consulting.

## The IR Pattern

IR = Intermediate Representation. Key pattern for reliable reports.

</div>

<div class="lang-zh">

10倍并行。Task 工具：咨询最强功能。

## IR 模式

IR = 中间表示。可靠报告的关键模式。

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

### Why IR

Checkpoint between processing and generation:

1. **Auditable**: Inspect before output
2. **Iterative**: Regenerate without reprocessing
3. **Verifiable**: Facts trace to IR

### Two-Phase Generation

**Phase 1: Raw IR**
- Query with tag/source filters
- Output candidate JSON

**Phase 2: Normalized IR**
- Merge duplicates
- Add translations
- Normalize dates (YYYY-MM-DD)
- Validate metadata

Separation prevents error propagation.

## Report Validation

Critical: **every fact needs a source reference.**

</div>

<div class="lang-zh">

### 为什么用 IR

处理和生成之间的检查点：

1. **可审计**：输出前检查
2. **可迭代**：无需重新处理即可重新生成
3. **可验证**：事实追溯到 IR

### 两阶段生成

**第一阶段：原始 IR**
- 用标签/来源过滤器查询
- 输出候选 JSON

**第二阶段：规范化 IR**
- 合并重复
- 添加翻译
- 规范化日期（YYYY-MM-DD）
- 验证元数据

分离防止错误传播。

## 报告验证

关键：**每个事实都需要来源引用。**

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

### report-validator Skill

3 steps:

1. **Extract**: Parse markdown → `.validation.json`
2. **Search**: Task agents find sources in parallel
3. **Check**: Verify no `"NOT_FOUND"`

### Smart Matching

Handles format variations:

- **Dates**: "2026-01-07" = "January 7" = "1月7日"
- **Numbers**: "1.8B" = "18亿" = "1.8 billion"

Core values must exist in source. Format doesn't matter.

### Zero Tolerance

Any missing source → validation fails. Forces:

- Accurate transcription
- No invented details
- Traceable claims

## Agent Skills

Reusable instruction sets. Encapsulated domain expertise.

</div>

<div class="lang-zh">

### report-validator 技能

3步：

1. **提取**：解析 markdown → `.validation.json`
2. **搜索**：Task 智能体并行查找来源
3. **检查**：验证无 `"NOT_FOUND"`

### 智能匹配

处理格式变体：

- **日期**："2026-01-07" = "January 7" = "1月7日"
- **数字**："1.8B" = "18亿" = "1.8 billion"

核心值必须存在于来源。格式无所谓。

### 零容忍

任何缺失来源 → 验证失败。强制：

- 准确转录
- 无虚构细节
- 可追溯声明

## Agent 技能

可复用指令集。封装领域专业知识。

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

### 数据分析的关键技能

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

1. **Reframe the problem**: Data analysis → codebase file editing. Claude Code is optimized for this.

2. **Chunk strategically**: 200 records per file, 2000 lines max. Fits Claude Code's tools perfectly.

3. **Parallelize with Task agents**: 10x throughput for labeling, classification, validation.

4. **Use IR as checkpoint**: Separate data processing from report generation. Enables iteration and auditing.

5. **Validate everything**: The report-validator pattern catches hallucinations before delivery.

6. **Encapsulate in skills**: Domain expertise becomes reusable, maintainable instruction sets.

The result: enterprise-quality reports from 25K+ articles, with every fact traceable to source data.

Claude Code isn't just for writing code. It's a general-purpose agent for any task that can be expressed as file operations. Data analysis fits perfectly.

</div>

<div class="lang-zh">

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
