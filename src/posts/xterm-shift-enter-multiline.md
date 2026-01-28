---
title: "Adding Shift+Enter for Multiline Input in xterm.js"
date: 2026-01-29
excerpt: How to map Shift+Enter to Alt+Enter for multiline shell commands in xterm.js, and the gotcha that causes double newlines.
---

<div class="lang-en">

When building a web terminal with xterm.js, users expect Shift+Enter to insert a newline without executing the command. This is standard behavior in chat apps and code editors. But xterm.js doesn't support this out of the box.

This post shows how to implement it by mapping Shift+Enter to Alt+Enter (which zsh natively supports), and the subtle bug that causes double newlines.

## The Goal

Allow users to write multiline shell commands:

```bash
echo "line 1" && \
echo "line 2" && \
echo "line 3"
```

By pressing Shift+Enter instead of manually typing `\` and Enter.

## The Solution: Map to Alt+Enter

Zsh natively supports Alt+Enter (Esc+Return) for inserting a literal newline. The escape sequence is `\x1b\r` (Escape + Carriage Return).

Use `attachCustomKeyEventHandler` to intercept Shift+Enter:

```javascript
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.key === "Enter" && ev.shiftKey) {
    if (ev.type === "keydown") {
      // Send Esc + Return (same as Alt+Enter in zsh)
      ws.send({ type: "input", data: "\x1b\r" });
    }
    return false; // Block the event
  }
  return true;
});
```

## The Double Newline Bug

The first implementation looked like this:

```javascript
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.type === "keydown" && ev.key === "Enter" && ev.shiftKey) {
    ws.send({ type: "input", data: "\x1b\r" });
    return false;
  }
  return true;
});
```

**Problem:** This created two newlines instead of one.

**Why:** The handler only blocked `keydown`, but `keypress` and `keyup` events still fired. One of these triggered additional input processing.

**Fix:** Block all event types for Shift+Enter, but only send the escape sequence on `keydown`:

```javascript
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.key === "Enter" && ev.shiftKey) {
    // Only send on keydown, ignore keyup/keypress
    if (ev.type === "keydown") {
      ws.send({ type: "input", data: "\x1b\r" });
    }
    // Block ALL Shift+Enter events
    return false;
  }
  return true;
});
```

## Why Alt+Enter Works in Zsh

In zsh, `\e\r` (Esc + Return) is bound to `self-insert-unmeta`. This command strips the escape prefix and inserts the character literally. So Esc+Return inserts a literal carriage return, creating a newline in the command buffer without executing.

From the [Zsh Line Editor documentation](https://zsh.sourceforge.io/Doc/Release/Zsh-Line-Editor.html):

> `self-insert-unmeta`: Insert the character you get by stripping the escape or top bit from what was typed.

## Other Approaches That Failed

Before finding the Alt+Enter mapping, I tried several approaches:

**1. Ctrl+V, Ctrl+J (`\x16\x0a`):**
```javascript
ws.send({ type: "input", data: "\x16\x0a" });
```
Created two newlines. The quoted newline plus echo created extra output.

**2. Bracketed paste mode:**
```javascript
ws.send({ type: "input", data: "\x1b[200~\n\x1b[201~" });
```
Didn't work at all. The shell didn't recognize the bracketed paste.

**3. Backslash + newline:**
```javascript
ws.send({ type: "input", data: " \\\n" });
```
Inserted the backslash but didn't continue the line properly.

## Full Implementation

Here's the complete handler with the WebSocket integration:

```javascript
// Handle Shift+Enter for multiline input
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.key === "Enter" && ev.shiftKey) {
    if (ev.type === "keydown") {
      wsRef.current?.send({ type: "input", data: "\x1b\r" });
    }
    return false;
  }
  return true;
});

// Normal input handling
terminal.onData((data) => {
  wsRef.current?.send({ type: "input", data });
});
```

## Key Takeaways

1. **Use native shell bindings** - Don't reinvent multiline input. Zsh already has Alt+Enter.

2. **Block all event types** - Returning `false` only for `keydown` isn't enough. You must block `keyup` and `keypress` too.

3. **Test the escape sequence** - `\x1b\r` works in zsh. For bash, you may need different handling or add a binding to `.inputrc`.

</div>

<div class="lang-zh">

在使用 xterm.js 构建 Web 终端时，用户期望 Shift+Enter 能插入换行而不执行命令。这在聊天应用和代码编辑器中是标准行为，但 xterm.js 原生不支持。

本文介绍如何通过映射 Shift+Enter 到 Alt+Enter（zsh 原生支持）来实现这个功能，以及导致双重换行的隐蔽 bug。

## 目标

让用户能够编写多行 shell 命令：

```bash
echo "line 1" && \
echo "line 2" && \
echo "line 3"
```

通过按 Shift+Enter 而不是手动输入 `\` 和 Enter。

## 解决方案：映射到 Alt+Enter

Zsh 原生支持 Alt+Enter（Esc+Return）来插入字面换行符。转义序列是 `\x1b\r`（Escape + 回车）。

使用 `attachCustomKeyEventHandler` 拦截 Shift+Enter：

```javascript
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.key === "Enter" && ev.shiftKey) {
    if (ev.type === "keydown") {
      // 发送 Esc + Return（与 zsh 中的 Alt+Enter 相同）
      ws.send({ type: "input", data: "\x1b\r" });
    }
    return false; // 阻止事件
  }
  return true;
});
```

## 双重换行的 Bug

最初的实现是这样的：

```javascript
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.type === "keydown" && ev.key === "Enter" && ev.shiftKey) {
    ws.send({ type: "input", data: "\x1b\r" });
    return false;
  }
  return true;
});
```

**问题：** 这会产生两个换行而不是一个。

**原因：** 处理程序只阻止了 `keydown`，但 `keypress` 和 `keyup` 事件仍然触发。其中一个触发了额外的输入处理。

**修复：** 阻止所有 Shift+Enter 事件类型，但只在 `keydown` 时发送转义序列：

```javascript
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.key === "Enter" && ev.shiftKey) {
    // 只在 keydown 时发送，忽略 keyup/keypress
    if (ev.type === "keydown") {
      ws.send({ type: "input", data: "\x1b\r" });
    }
    // 阻止所有 Shift+Enter 事件
    return false;
  }
  return true;
});
```

## 为什么 Alt+Enter 在 Zsh 中有效

在 zsh 中，`\e\r`（Esc + Return）绑定到 `self-insert-unmeta`。这个命令会去掉 escape 前缀并直接插入字符。所以 Esc+Return 会插入一个字面回车符，在命令缓冲区中创建换行而不执行。

来自 [Zsh Line Editor 文档](https://zsh.sourceforge.io/Doc/Release/Zsh-Line-Editor.html)：

> `self-insert-unmeta`：插入去掉 escape 或最高位后得到的字符。

## 其他失败的尝试

在找到 Alt+Enter 映射之前，我尝试了几种方法：

**1. Ctrl+V, Ctrl+J (`\x16\x0a`)：**
```javascript
ws.send({ type: "input", data: "\x16\x0a" });
```
产生了两个换行。引用的换行加上回显产生了额外输出。

**2. 括号粘贴模式：**
```javascript
ws.send({ type: "input", data: "\x1b[200~\n\x1b[201~" });
```
完全不起作用。shell 不识别括号粘贴。

**3. 反斜杠 + 换行：**
```javascript
ws.send({ type: "input", data: " \\\n" });
```
插入了反斜杠但没有正确续行。

## 完整实现

以下是包含 WebSocket 集成的完整处理程序：

```javascript
// 处理 Shift+Enter 的多行输入
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.key === "Enter" && ev.shiftKey) {
    if (ev.type === "keydown") {
      wsRef.current?.send({ type: "input", data: "\x1b\r" });
    }
    return false;
  }
  return true;
});

// 正常输入处理
terminal.onData((data) => {
  wsRef.current?.send({ type: "input", data });
});
```

## 要点总结

1. **使用原生 shell 绑定** - 不要重新发明多行输入。Zsh 已经有 Alt+Enter。

2. **阻止所有事件类型** - 只对 `keydown` 返回 `false` 是不够的。必须同时阻止 `keyup` 和 `keypress`。

3. **测试转义序列** - `\x1b\r` 在 zsh 中有效。对于 bash，可能需要不同的处理或在 `.inputrc` 中添加绑定。

</div>
