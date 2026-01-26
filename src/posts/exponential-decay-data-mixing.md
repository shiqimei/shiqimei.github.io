---
title: "Mixing High-Quality Data into Large Datasets with Exponential Decay"
date: 2026-01-26
excerpt: A practical technique for distributing curated records across large datasets using exponential decay, ensuring quality surfaces early without clustering.
---

<div class="lang-en">

You have 1,000 high-quality records. You have 10,000 total records, most of which are noise. How do you mix them so users encounter quality early, but don't run out of it halfway through?

This problem appears everywhere: search result ranking, content feeds, training data curation, annotation prioritization. The naive approaches fail:

- **Front-loading**: Put all quality at the top. Users who go deep find nothing.
- **Uniform distribution**: 10% quality everywhere. Users must wade through noise to find gems.
- **Random shuffle**: Unpredictable. Sometimes quality clusters, sometimes it doesn't.

Exponential decay offers a better solution.

## The Problem

Given:
- 1,000 high-quality records (curated, verified, important)
- 10,000 total positions in the dataset
- Goal: Quality should appear early and taper off gradually

Constraints:
- First 1,000 positions should have ~30% quality (300 records)
- Quality should never completely disappear
- Distribution should feel natural, not abrupt

## The Math

Exponential decay follows the formula:

```
count(bucket_i) = initial_count × decay_factor^i
```

For our case with 1,000 quality records across 10,000 positions (10 buckets of 1,000 each):

- We want ~300 in the first bucket (30% density)
- We need to find a decay factor that distributes the remaining 700 across buckets 2-10

Solving for decay factor `k`:

```
300 × (1 + k + k² + ... + k⁹) = 1000
300 × (1 - k¹⁰) / (1 - k) = 1000
```

This gives us `k ≈ 0.72`.

## The Distribution

With initial count = 300 and decay factor = 0.72:

| Bucket | Positions | Quality Records | Density |
|--------|-----------|-----------------|---------|
| 1 | 1-1000 | 300 | 30.0% |
| 2 | 1001-2000 | 216 | 21.6% |
| 3 | 2001-3000 | 156 | 15.6% |
| 4 | 3001-4000 | 112 | 11.2% |
| 5 | 4001-5000 | 81 | 8.1% |
| 6 | 5001-6000 | 58 | 5.8% |
| 7 | 6001-7000 | 42 | 4.2% |
| 8 | 7001-8000 | 30 | 3.0% |
| 9 | 8001-9000 | 22 | 2.2% |
| 10 | 9001-10000 | 16 | 1.6% |
| **Total** | | **1033** | |

Key properties:
- First 3,000 positions contain 672 quality records (67%)
- First 5,000 positions contain 865 quality records (87%)
- Even the last bucket has 16 quality records (not zero)
- Ratio from first to last: 30% → 1.6% (roughly 20:1)

## Implementation

The algorithm has three steps:

**Step 1: Calculate bucket targets**

```typescript
function calculateBucketTargets(
  totalPositions: number,
  totalQuality: number,
  firstBucketCount: number,
  decayFactor: number,
  bucketSize: number
): number[] {
  const numBuckets = Math.ceil(totalPositions / bucketSize);
  const targets: number[] = [];

  let count = firstBucketCount;
  for (let i = 0; i < numBuckets; i++) {
    targets.push(Math.round(count));
    count *= decayFactor;
  }

  // Scale to match total
  const sum = targets.reduce((a, b) => a + b, 0);
  const scale = totalQuality / sum;
  return targets.map(t => Math.round(t * scale));
}
```

**Step 2: Randomly assign positions within each bucket**

```typescript
function randomPositions(
  start: number,
  end: number,
  count: number
): number[] {
  const available = Array.from(
    { length: end - start },
    (_, i) => start + i
  );
  const selected: number[] = [];

  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    selected.push(available[idx]);
    available.splice(idx, 1);
  }

  return selected;
}
```

**Step 3: Build the final dataset**

```typescript
// Assign quality records to positions
const qualityPositions = new Set<number>();
let qualityIdx = 0;

for (let bucket = 0; bucket < bucketTargets.length; bucket++) {
  const start = bucket * BUCKET_SIZE;
  const end = Math.min((bucket + 1) * BUCKET_SIZE, totalPositions);
  const count = bucketTargets[bucket];

  const positions = randomPositions(start, end, count);
  positions.forEach(p => qualityPositions.add(p));
}

// Place records
const result = new Array(totalPositions);
const shuffledQuality = shuffle(qualityRecords);

let qIdx = 0;
let nIdx = 0;

for (let i = 0; i < totalPositions; i++) {
  if (qualityPositions.has(i)) {
    result[i] = shuffledQuality[qIdx++];
  } else {
    result[i] = noiseRecords[nIdx++];
  }
}
```

## Tuning the Parameters

**Decay factor controls the curve steepness:**

| Decay Factor | First Bucket | Last Bucket | Ratio |
|--------------|--------------|-------------|-------|
| 0.90 | 14% | 5% | 3:1 |
| 0.80 | 22% | 2% | 11:1 |
| 0.72 | 30% | 1.6% | 19:1 |
| 0.60 | 40% | 0.2% | 200:1 |

**First bucket count controls the starting density:**

- Want aggressive front-loading? Start at 40-50%
- Want gentler distribution? Start at 15-20%
- The decay factor will determine how fast it tapers

**Bucket size controls granularity:**

- Larger buckets (1000): Smoother distribution, less computation
- Smaller buckets (100): Finer control, more natural decay

## When to Use This

**Good fit:**
- Search results where relevance decreases with position
- Content feeds where engagement drops over scroll depth
- Annotation queues where you want reviewers to see good examples first
- Training data where curriculum learning benefits from quality gradients

**Poor fit:**
- When position doesn't correlate with consumption probability
- When uniform quality distribution is actually desired
- When quality records exceed 50% of total (just sort by quality instead)

## Variations

**Multi-tier quality**: Instead of binary quality/noise, you might have tiers (excellent, good, fair, poor). Apply exponential decay to each tier with different parameters.

**Adaptive decay**: If you have engagement data, adjust the decay factor based on actual user behavior. If users go deeper than expected, flatten the curve.

**Bucketed randomization**: Instead of pure random assignment within buckets, you can further stratify by secondary attributes (date, source, topic) to ensure diversity.

## The Key Insight

Exponential decay matches human attention patterns. Users are most likely to engage with early items, less likely with later ones. By front-loading quality with gradual decay, you:

1. Maximize early engagement (quality when attention is highest)
2. Maintain discovery (quality never hits zero)
3. Feel natural (gradual decline, not cliff edges)

The math is simple. The impact on user experience is significant.

</div>

<div class="lang-zh">

你有1000条高质量记录，还有10000条总记录，大部分是噪声。如何混合它们，让用户尽早遇到高质量内容，同时不会在中途就耗尽？

这个问题随处可见：搜索结果排序、内容信息流、训练数据筛选、标注优先级排序。朴素的方法都会失败：

- **前置集中**：把所有高质量放在最前面。深入浏览的用户什么都找不到。
- **均匀分布**：到处都是10%的高质量。用户必须在噪声中艰难寻找。
- **随机打乱**：不可预测。有时高质量聚集，有时不会。

指数衰减提供了更好的解决方案。

## 问题定义

已知：
- 1000条高质量记录（经过筛选、验证、重要的）
- 数据集中共10000个位置
- 目标：高质量应该早出现，然后逐渐减少

约束：
- 前1000个位置应有约30%的高质量（300条记录）
- 高质量永远不应完全消失
- 分布应该自然，不要突兀

## 数学原理

指数衰减遵循公式：

```
count(bucket_i) = initial_count × decay_factor^i
```

对于我们的案例，1000条高质量记录分布在10000个位置（10个各1000的桶）：

- 我们希望第一个桶有约300条（30%密度）
- 我们需要找到一个衰减因子，将剩余700条分布在第2-10个桶

求解衰减因子`k`：

```
300 × (1 + k + k² + ... + k⁹) = 1000
300 × (1 - k¹⁰) / (1 - k) = 1000
```

得到`k ≈ 0.72`。

## 分布结果

初始数量 = 300，衰减因子 = 0.72：

| 桶 | 位置 | 高质量记录 | 密度 |
|----|------|-----------|------|
| 1 | 1-1000 | 300 | 30.0% |
| 2 | 1001-2000 | 216 | 21.6% |
| 3 | 2001-3000 | 156 | 15.6% |
| 4 | 3001-4000 | 112 | 11.2% |
| 5 | 4001-5000 | 81 | 8.1% |
| 6 | 5001-6000 | 58 | 5.8% |
| 7 | 6001-7000 | 42 | 4.2% |
| 8 | 7001-8000 | 30 | 3.0% |
| 9 | 8001-9000 | 22 | 2.2% |
| 10 | 9001-10000 | 16 | 1.6% |
| **总计** | | **1033** | |

关键特性：
- 前3000个位置包含672条高质量记录（67%）
- 前5000个位置包含865条高质量记录（87%）
- 即使最后一个桶也有16条高质量记录（不是零）
- 首尾比例：30% → 1.6%（约20:1）

## 实现

算法分三步：

**步骤1：计算各桶目标数量**

```typescript
function calculateBucketTargets(
  totalPositions: number,
  totalQuality: number,
  firstBucketCount: number,
  decayFactor: number,
  bucketSize: number
): number[] {
  const numBuckets = Math.ceil(totalPositions / bucketSize);
  const targets: number[] = [];

  let count = firstBucketCount;
  for (let i = 0; i < numBuckets; i++) {
    targets.push(Math.round(count));
    count *= decayFactor;
  }

  // 缩放以匹配总数
  const sum = targets.reduce((a, b) => a + b, 0);
  const scale = totalQuality / sum;
  return targets.map(t => Math.round(t * scale));
}
```

**步骤2：在每个桶内随机分配位置**

```typescript
function randomPositions(
  start: number,
  end: number,
  count: number
): number[] {
  const available = Array.from(
    { length: end - start },
    (_, i) => start + i
  );
  const selected: number[] = [];

  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    selected.push(available[idx]);
    available.splice(idx, 1);
  }

  return selected;
}
```

**步骤3：构建最终数据集**

```typescript
// 将高质量记录分配到位置
const qualityPositions = new Set<number>();
let qualityIdx = 0;

for (let bucket = 0; bucket < bucketTargets.length; bucket++) {
  const start = bucket * BUCKET_SIZE;
  const end = Math.min((bucket + 1) * BUCKET_SIZE, totalPositions);
  const count = bucketTargets[bucket];

  const positions = randomPositions(start, end, count);
  positions.forEach(p => qualityPositions.add(p));
}

// 放置记录
const result = new Array(totalPositions);
const shuffledQuality = shuffle(qualityRecords);

let qIdx = 0;
let nIdx = 0;

for (let i = 0; i < totalPositions; i++) {
  if (qualityPositions.has(i)) {
    result[i] = shuffledQuality[qIdx++];
  } else {
    result[i] = noiseRecords[nIdx++];
  }
}
```

## 参数调优

**衰减因子控制曲线陡峭程度：**

| 衰减因子 | 第一桶 | 最后一桶 | 比例 |
|----------|--------|----------|------|
| 0.90 | 14% | 5% | 3:1 |
| 0.80 | 22% | 2% | 11:1 |
| 0.72 | 30% | 1.6% | 19:1 |
| 0.60 | 40% | 0.2% | 200:1 |

**第一桶数量控制起始密度：**

- 想要激进的前置？从40-50%开始
- 想要温和的分布？从15-20%开始
- 衰减因子决定下降速度

**桶大小控制粒度：**

- 较大的桶（1000）：分布更平滑，计算更少
- 较小的桶（100）：控制更精细，衰减更自然

## 适用场景

**适合使用：**
- 相关性随位置下降的搜索结果
- 互动率随滚动深度下降的内容信息流
- 希望审核员先看到好样本的标注队列
- 课程学习受益于质量梯度的训练数据

**不适合使用：**
- 位置与消费概率不相关时
- 确实需要均匀质量分布时
- 高质量记录超过总量50%时（直接按质量排序即可）

## 变体

**多层质量**：不是二元的质量/噪声，可能有多个层级（优秀、良好、一般、差）。对每个层级使用不同参数应用指数衰减。

**自适应衰减**：如果有互动数据，根据实际用户行为调整衰减因子。如果用户比预期走得更深，就把曲线压平。

**分桶随机化**：不是在桶内纯随机分配，可以按次级属性（日期、来源、主题）进一步分层，确保多样性。

## 核心洞察

指数衰减符合人类注意力模式。用户最可能与早期项目互动，后期项目的可能性递减。通过前置高质量内容并逐渐衰减，你可以：

1. 最大化早期互动（注意力最高时呈现质量）
2. 保持发现性（质量永不归零）
3. 感觉自然（渐进下降，没有断崖）

数学很简单，对用户体验的影响却很显著。

</div>
