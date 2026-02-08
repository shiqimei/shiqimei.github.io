---
title: "Why Our WebSocket Takes 23 Seconds to Connect (React StrictMode + IPv6)"
date: 2026-02-08
excerpt: A WebSocket connection that should take 100ms was taking 23 seconds. Debugging it required structured logging on both frontend and backend to isolate the problem to React StrictMode zombie WebSockets and IPv6 fallback delays.
---

<div class="lang-en">

Our ACP demo server connects to a backend via WebSocket. The connection should take under 500ms — our Playwright pressure test confirmed this. But when opening the browser, it consistently took 20-30 seconds. The UI showed a blank "connecting..." state for an eternity.

This post documents the debugging strategy that found three stacked root causes, and the fix.

## Symptoms

Opening `localhost:5688` after a fresh browser launch:

- First WebSocket attempt hangs for exactly 10 seconds, then errors
- Second attempt also hangs for exactly 10 seconds
- Third attempt connects in ~300ms
- Total: **~23 seconds** of dead time

## Debugging Strategy: Logs on Both Sides

The trap with WebSocket latency is that the problem can live on either side. We started by adding logs to the server — and saw nothing wrong. Connections appeared instantly from the server's perspective. That was the clue: the bottleneck was entirely client-side.

### Step 1: Structured Backend Logging

We replaced all hand-rolled `console.log` calls with [pino](https://github.com/pinojs/pino) structured logging. Every WebSocket lifecycle event got a structured log with timing fields:

```typescript
// Before: string interpolation scattered through business logic
console.log(`[ws] open client=${clientId} path=${path} ${Date.now()}ms`);

// After: structured fields, automatic timestamps, separate from business logic
log.info({ client: clientId, path, boot: bootMs() }, "ws: open");
```

This gave us clean, filterable server logs with `boot` (ms since server start), `durationMs` on every operation, and `session` IDs for correlation. We could immediately see that the server-side connection handling took <1ms. The problem wasn't here.

### Step 2: Client-Side Profiling Timestamps

We added `performance.now()` timestamps at every WebSocket lifecycle point in the React component, measured relative to page navigation start:

```typescript
function pageMs(): string {
  return performance.now().toFixed(0) + "ms";
}

// Every lifecycle point gets a timestamp
console.log(`[${pageMs()}] ws new WebSocket(${wsUrl})`);
// ...
console.log(`[${pageMs()}] ws OPEN (handshake=${handshakeMs}ms)`);
// ...
console.log(`[${pageMs()}] ws CLOSED code=${ev.code}`);
```

The key points instrumented:
- **`useEffect` mount/cleanup** — when React runs the effect
- **`new WebSocket()` constructor** — when the connection attempt starts
- **`onopen`** — when the TCP + WS handshake completes
- **`onerror` / `onclose`** — when connections fail
- **`onmessage` (first)** — when the first server message arrives
- **Connection timeout** — when we give up and retry

### Step 3: Read the Timeline

With both sides instrumented, we could read the full story:

```
[970ms]  useEffect mount → new WebSocket(ws://localhost:5689/ws)
[971ms]  useEffect cleanup → close(readyState=CONNECTING)
[972ms]  useEffect mount → new WebSocket(ws://localhost:5689/ws)
[10981ms] ERROR (10 seconds later!)
[11981ms] retry → new WebSocket
[21983ms] ERROR (another 10 seconds!)
[22984ms] retry → new WebSocket
[23300ms] OPEN (316ms handshake)
```

Three patterns jumped out:
1. **mount → cleanup → mount** within 2ms — React StrictMode double-mount
2. **Exactly 10s gaps** — our connection timeout, not a network issue
3. **316ms handshake** on the successful attempt — way too slow for localhost

Each pattern pointed to a distinct root cause.

## Root Cause 1: React StrictMode Creates Zombie WebSockets

In development, React StrictMode double-mounts every component: mount → unmount → mount. Our WebSocket `useEffect`:

1. **Mount 1** (970ms): Creates WebSocket #1, starts TCP handshake
2. **Cleanup** (971ms): Calls `ws.close()` on WebSocket #1 — now in `CLOSING` state
3. **Mount 2** (972ms): Creates WebSocket #2, starts TCP handshake

WebSocket #1 is now a zombie — its JavaScript handlers are nulled, but the browser is still completing the TCP close handshake with the server. Chrome's connection pool sees an active connection to `localhost:5689` and **queues WebSocket #2 behind it**.

The result: WebSocket #2 can't connect until WebSocket #1's TCP close fully completes, which is gated by our 10-second connection timeout.

## Root Cause 2: 10-Second Connection Timeout

We had a "safety" timeout that killed WebSocket connections after 10 seconds:

```javascript
connectTimeout = setTimeout(() => {
  if (ws.readyState === WebSocket.CONNECTING) {
    ws.close(); // kill it, try again
    reconnectTimer = setTimeout(connect, 1000);
  }
}, 10_000); // 10 seconds!
```

For a localhost connection that should complete in <100ms, 10 seconds is absurd. Each failed attempt burned the full 10 seconds before retrying.

## Root Cause 3: `localhost` Triggers IPv6 Fallback

The WebSocket URL used `localhost`:

```javascript
const wsUrl = `ws://localhost:5689/ws`;
```

Chrome resolves `localhost` and tries IPv6 (`::1`) first. Our Bun server listens on `0.0.0.0` (IPv4 only). Chrome's IPv6 attempt fails, then it falls back to IPv4 `127.0.0.1`. This added hundreds of milliseconds to every successful connection — the "316ms handshake" for what should be a <10ms localhost connection.

## The Fix

**1. Remove StrictMode.** This is a dev tool, not a production app. No zombie WebSockets, no queued connections.

```jsx
// Before
createRoot(root).render(<StrictMode><App /></StrictMode>);

// After
createRoot(root).render(<App />);
```

**2. Reduce connection timeout to 1 second** with 100ms retry.

```javascript
connectTimeout = setTimeout(() => {
  if (ws.readyState === WebSocket.CONNECTING) {
    ws.close();
    setTimeout(connect, 100);
  }
}, 1000);
```

**3. Use `127.0.0.1` instead of `localhost`** to skip IPv6 resolution entirely.

```javascript
const wsHost = location.port === "5688"
  ? "127.0.0.1:5689"
  : location.host;
```

## Result

Before: 23 seconds. After: under 500ms. Matching what our Playwright pressure test always showed.

### Validating with a Pressure Test

We wrote a Playwright-based pressure test that measures real cold-start latency — spawning the server and connecting immediately without waiting for warmup, just like a real user:

```typescript
// Phase 1: Cold start — connect immediately, retry until server is ready
const coldResult = await measureTab(context, "cold-1", "cold",
  `ws://127.0.0.1:${port}/ws`);

// Phase 2: Warm — open N tabs simultaneously
const warmResults = await Promise.all(
  Array.from({ length: 20 }, (_, i) =>
    measureTab(context, `warm-${i+1}`, "warm",
      `ws://127.0.0.1:${port}/ws`)));
```

Results after the fix: cold start p99 < 200ms, warm p99 < 500ms for 20 simultaneous tabs.

## Key Takeaway

The connection was fast. The infrastructure around it — React StrictMode, aggressive timeouts, DNS resolution — made it slow. None of these would show up in a server-side profiling session.

The debugging strategy that worked:

1. **Add structured logs to the backend** — ruled out server-side causes instantly
2. **Add timestamped profiling to the frontend** — revealed the exact timeline of what the browser was doing
3. **Read the numbers** — the patterns (mount/cleanup/mount, exact 10s gaps, 316ms handshake) each pointed directly at a root cause
4. **Validate with a pressure test** — confirmed the fix works under load, not just for a single tab

When debugging latency: measure from the user's perspective first. The server was fine. The browser was the bottleneck.

</div>

<div class="lang-zh">

我们的 ACP 演示服务器通过 WebSocket 连接后端。连接本身应该在 500ms 以内完成——Playwright 压力测试已经证实了这一点。但每次打开浏览器，都要等 20-30 秒。界面一直显示"连接中..."，漫长得令人抓狂。

本文记录了排查策略、三层叠加的根因，以及最终的修复方案。

## 现象

新开浏览器访问 `localhost:5688`：

- 第一次 WebSocket 连接精确挂起 10 秒后报错
- 第二次同样挂起 10 秒
- 第三次 ~300ms 连接成功
- 总计：**约 23 秒**的空等

## 排查策略：前后端同时埋点

WebSocket 延迟问题的陷阱在于：瓶颈可能在任何一端。我们先在服务端加了日志——结果一切正常。连接在服务端看来几乎是瞬间完成的。这本身就是线索：瓶颈完全在客户端。

### 第一步：后端结构化日志

我们把所有手写的 `console.log` 替换为 [pino](https://github.com/pinojs/pino) 结构化日志。每个 WebSocket 生命周期事件都有带时间字段的结构化记录：

```typescript
// 改造前：字符串拼接散落在业务逻辑中
console.log(`[ws] open client=${clientId} path=${path} ${Date.now()}ms`);

// 改造后：结构化字段，自动时间戳，与业务逻辑分离
log.info({ client: clientId, path, boot: bootMs() }, "ws: open");
```

这样我们得到了干净、可过滤的服务端日志，每个操作都有 `boot`（服务启动后毫秒数）、`durationMs` 和 `session` ID 用于关联。我们立刻看到服务端连接处理耗时不到 1ms。问题不在这里。

### 第二步：客户端精确打点

我们在 React 组件的每个 WebSocket 生命周期节点添加了 `performance.now()` 时间戳，相对于页面加载起点：

```typescript
function pageMs(): string {
  return performance.now().toFixed(0) + "ms";
}

// 每个生命周期节点都有时间戳
console.log(`[${pageMs()}] ws new WebSocket(${wsUrl})`);
// ...
console.log(`[${pageMs()}] ws OPEN (handshake=${handshakeMs}ms)`);
// ...
console.log(`[${pageMs()}] ws CLOSED code=${ev.code}`);
```

关键埋点位置：
- **`useEffect` 挂载/清理** — React 执行 effect 的时机
- **`new WebSocket()` 构造** — 连接尝试开始
- **`onopen`** — TCP + WS 握手完成
- **`onerror` / `onclose`** — 连接失败
- **`onmessage`（首条）** — 收到第一条服务端消息
- **连接超时** — 放弃并重试的时刻

### 第三步：读懂时间线

前后端都埋好点后，完整的故事浮出水面：

```
[970ms]  useEffect 挂载 → new WebSocket(ws://localhost:5689/ws)
[971ms]  useEffect 清理 → close(readyState=CONNECTING)
[972ms]  useEffect 挂载 → new WebSocket(ws://localhost:5689/ws)
[10981ms] ERROR（整整 10 秒后！）
[11981ms] 重试 → new WebSocket
[21983ms] ERROR（又是 10 秒！）
[22984ms] 重试 → new WebSocket
[23300ms] OPEN（316ms 握手）
```

三个规律一目了然：
1. **mount → cleanup → mount** 在 2ms 内完成 — React StrictMode 双重挂载
2. **精确的 10 秒间隔** — 是我们的超时设定，不是网络问题
3. **316ms 握手** — 对 localhost 来说慢得离谱

每个规律都指向一个独立的根因。

## 根因一：React StrictMode 制造僵尸 WebSocket

开发模式下，React StrictMode 会对每个组件执行双重挂载：mount → unmount → mount。我们的 WebSocket `useEffect`：

1. **挂载 1**（970ms）：创建 WebSocket #1，开始 TCP 握手
2. **清理**（971ms）：对 #1 调用 `ws.close()`——进入 `CLOSING` 状态
3. **挂载 2**（972ms）：创建 WebSocket #2，开始 TCP 握手

WebSocket #1 成了僵尸——JavaScript 回调已被清空，但浏览器仍在与服务器完成 TCP 关闭握手。Chrome 的连接池看到 `localhost:5689` 上有一个活跃连接，于是**把 WebSocket #2 排在它后面**。

结果：WebSocket #2 必须等 #1 的 TCP 关闭彻底完成才能连接，而这受制于我们 10 秒的超时设定。

## 根因二：10 秒连接超时

我们设了一个"安全"超时，10 秒后强制断开连接：

```javascript
connectTimeout = setTimeout(() => {
  if (ws.readyState === WebSocket.CONNECTING) {
    ws.close();
    reconnectTimer = setTimeout(connect, 1000);
  }
}, 10_000); // 10 秒！
```

对于本该在 100ms 内完成的 localhost 连接来说，10 秒荒谬至极。每次失败都要白白耗尽整整 10 秒才会重试。

## 根因三：`localhost` 触发 IPv6 回退

WebSocket URL 使用了 `localhost`：

```javascript
const wsUrl = `ws://localhost:5689/ws`;
```

Chrome 解析 `localhost` 时优先尝试 IPv6（`::1`）。但我们的 Bun 服务器监听在 `0.0.0.0`（仅 IPv4）。Chrome 的 IPv6 尝试失败后才回退到 IPv4 的 `127.0.0.1`。这给每次成功连接多加了数百毫秒——本该 10ms 以内完成的 localhost 握手变成了 316ms。

## 修复

**1. 移除 StrictMode。** 这是开发工具，不是生产应用。没有僵尸 WebSocket，就没有排队阻塞。

```jsx
// 修改前
createRoot(root).render(<StrictMode><App /></StrictMode>);

// 修改后
createRoot(root).render(<App />);
```

**2. 连接超时从 10 秒降到 1 秒**，重试间隔 100ms。

```javascript
connectTimeout = setTimeout(() => {
  if (ws.readyState === WebSocket.CONNECTING) {
    ws.close();
    setTimeout(connect, 100);
  }
}, 1000);
```

**3. 用 `127.0.0.1` 替代 `localhost`**，彻底跳过 IPv6 解析。

```javascript
const wsHost = location.port === "5688"
  ? "127.0.0.1:5689"
  : location.host;
```

## 效果

修复前：23 秒。修复后：500ms 以内。与 Playwright 压力测试的结果完全一致。

### 用压力测试验证

我们编写了基于 Playwright 的压力测试，测量真实的冷启动延迟——启动服务器后立即连接，不等预热，和真实用户的行为完全一致：

```typescript
// 阶段 1：冷启动 — 立即连接，重试直到服务器就绪
const coldResult = await measureTab(context, "cold-1", "cold",
  `ws://127.0.0.1:${port}/ws`);

// 阶段 2：热连接 — 同时打开 N 个标签页
const warmResults = await Promise.all(
  Array.from({ length: 20 }, (_, i) =>
    measureTab(context, `warm-${i+1}`, "warm",
      `ws://127.0.0.1:${port}/ws`)));
```

修复后的结果：冷启动 p99 < 200ms，20 个同时连接的标签页热连接 p99 < 500ms。

## 核心启示

连接本身是快的。是外围的基础设施——React StrictMode、激进的超时策略、DNS 解析——把它拖慢了。这些问题在服务端性能分析中完全看不到。

有效的排查策略：

1. **后端加结构化日志** — 立刻排除了服务端原因
2. **前端加精确时间戳** — 还原了浏览器的完整行为时间线
3. **读懂数字** — mount/cleanup/mount 模式、精确的 10 秒间隔、316ms 握手，每个规律都直接指向一个根因
4. **用压力测试验证** — 确认修复在负载下也有效，不只是单个标签页

排查延迟问题时：先从用户视角测量。服务端没问题，瓶颈在浏览器。

</div>
