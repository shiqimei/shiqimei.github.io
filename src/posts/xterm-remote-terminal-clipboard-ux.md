---
title: "Building a Better Remote Terminal: Clipboard, Multiline, and Image Paste in xterm.js"
date: 2026-01-29
excerpt: How to implement Shift+Enter multiline input, tmux yank to local clipboard via OSC 52, and Ctrl+V image paste for Claude Code in a web-based terminal.
---

<div class="lang-en">

When building a web terminal with xterm.js that connects to a remote server via PTY, you quickly discover that basic terminal features don't work out of the box. Users expect:

1. **Shift+Enter** to insert newlines without executing
2. **Yank in tmux** to copy to their local clipboard
3. **Ctrl+V** to paste images (for tools like Claude Code)

This post covers the implementation of all three, including the subtle bugs encountered along the way.

## Architecture Overview

The setup: xterm.js in the browser connects via WebSocket to a backend that runs `docker exec` with PTY allocation. Inside the container, tmux provides session persistence, and Claude Code runs as the primary application.

```
Browser (xterm.js) <--WebSocket--> API Server <--docker exec--> Container (tmux + Claude Code)
```

The challenge is bridging the gap between browser APIs and the remote terminal environment.

## 1. Shift+Enter for Multiline Input

Users expect Shift+Enter to insert a newline without executing the command. This is standard in chat apps and code editors.

### The Solution: Map to Alt+Enter

Zsh natively supports Alt+Enter (Esc+Return) for inserting a literal newline. The escape sequence is `\x1b\r`.

</div>

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

<div class="lang-zh">

使用 xterm.js 构建连接远程服务器的 Web 终端时，你会发现基本的终端功能并不是开箱即用的。用户期望：

1. **Shift+Enter** 插入换行而不执行命令
2. **tmux 复制模式** 能将内容复制到本地剪贴板
3. **Ctrl+V** 粘贴图片（用于 Claude Code 等工具）

本文涵盖这三个功能的实现，包括过程中遇到的隐蔽 bug。

## 架构概述

整体架构：浏览器中的 xterm.js 通过 WebSocket 连接到后端，后端运行带 PTY 的 `docker exec`。容器内，tmux 提供会话持久化，Claude Code 作为主要应用运行。

```
浏览器 (xterm.js) <--WebSocket--> API 服务器 <--docker exec--> 容器 (tmux + Claude Code)
```

挑战在于打通浏览器 API 和远程终端环境之间的鸿沟。

## 1. Shift+Enter 多行输入

用户期望 Shift+Enter 能插入换行而不执行命令。这在聊天应用和代码编辑器中是标准行为。

### 解决方案：映射到 Alt+Enter

Zsh 原生支持 Alt+Enter（Esc+Return）插入字面换行符。转义序列是 `\x1b\r`。

</div>

<div class="lang-en">

### The Double Newline Bug

The first implementation only blocked `keydown`:

</div>

```javascript
// BUG: Creates two newlines
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.type === "keydown" && ev.key === "Enter" && ev.shiftKey) {
    ws.send({ type: "input", data: "\x1b\r" });
    return false;
  }
  return true;
});
```

<div class="lang-zh">

### 双重换行的 Bug

最初的实现只阻止了 `keydown`：

</div>

<div class="lang-en">

**Problem:** Two newlines appeared instead of one.

**Why:** The handler only blocked `keydown`, but `keypress` and `keyup` events still fired, triggering additional input processing.

**Fix:** Block all event types, but only send the escape sequence on `keydown`:

</div>

```javascript
terminal.attachCustomKeyEventHandler((ev) => {
  if (ev.key === "Enter" && ev.shiftKey) {
    if (ev.type === "keydown") {
      ws.send({ type: "input", data: "\x1b\r" });
    }
    // Block ALL Shift+Enter events (keydown, keyup, keypress)
    return false;
  }
  return true;
});
```

<div class="lang-zh">

**问题：** 出现两个换行而不是一个。

**原因：** 处理程序只阻止了 `keydown`，但 `keypress` 和 `keyup` 事件仍然触发，导致额外的输入处理。

**修复：** 阻止所有事件类型，但只在 `keydown` 时发送转义序列。

</div>

<div class="lang-en">

## 2. tmux Yank to Local Clipboard

When you select text in tmux copy mode and press `y` to yank, you expect it in your system clipboard. But by default, tmux's clipboard is isolated inside the container.

### The Solution: OSC 52 Escape Sequences

OSC 52 is a terminal escape sequence that tells the terminal emulator to set the system clipboard. Modern terminals (iTerm2, Windows Terminal, etc.) support it, and so does xterm.js with the `@xterm/addon-clipboard`.

**Step 1:** Configure tmux to emit OSC 52:

</div>

```bash
# ~/.tmux.conf
set -g set-clipboard on
```

<div class="lang-zh">

## 2. tmux 复制到本地剪贴板

在 tmux 复制模式中选择文本并按 `y` 复制时，你期望内容出现在系统剪贴板中。但默认情况下，tmux 的剪贴板被隔离在容器内。

### 解决方案：OSC 52 转义序列

OSC 52 是一种终端转义序列，告诉终端模拟器设置系统剪贴板。现代终端（iTerm2、Windows Terminal 等）都支持它，xterm.js 通过 `@xterm/addon-clipboard` 也支持。

**第一步：** 配置 tmux 发送 OSC 52：

</div>

<div class="lang-en">

**Step 2:** Add the ClipboardAddon to xterm.js:

</div>

```javascript
import { ClipboardAddon } from "@xterm/addon-clipboard";

// Custom provider to handle tmux's selection type
const clipboardProvider = {
  readText: async (selection) => {
    if (selection !== "c") return "";
    return navigator.clipboard.readText();
  },
  writeText: async (selection, text) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }
};

const clipboardAddon = new ClipboardAddon(undefined, clipboardProvider);
terminal.loadAddon(clipboardAddon);
```

<div class="lang-zh">

**第二步：** 在 xterm.js 中添加 ClipboardAddon：

</div>

<div class="lang-en">

### The Selection Type Gotcha

The default ClipboardAddon only accepts selection type `"c"` (clipboard). But tmux sends an empty selection type. The custom provider above accepts any selection type, which fixes the issue.

**Debugging tip:** Add logging to see what tmux sends:

</div>

```javascript
writeText: async (selection, text) => {
  console.log(`[Clipboard] selection: ${selection}, text length: ${text.length}`);
  await navigator.clipboard.writeText(text);
}
```

<div class="lang-zh">

### 选择类型的坑

默认的 ClipboardAddon 只接受选择类型 `"c"`（剪贴板）。但 tmux 发送的是空的选择类型。上面的自定义 provider 接受任何选择类型，解决了这个问题。

**调试技巧：** 添加日志查看 tmux 发送的内容。

</div>

<div class="lang-en">

## 3. Ctrl+V Image Paste for Claude Code

Claude Code supports pasting images with Ctrl+V. On a local terminal, it reads from the system clipboard. But in a web terminal, we need to:

1. Intercept Ctrl+V in the browser
2. Read the image from the browser's clipboard
3. Transfer it to the container
4. Set the container's X clipboard
5. Send Ctrl+V to Claude Code

### Container Setup

The container needs X clipboard support even in headless mode:

</div>

```dockerfile
# Dockerfile
RUN apk add --no-cache xclip xvfb
```

<div class="lang-zh">

## 3. Ctrl+V 图片粘贴支持 Claude Code

Claude Code 支持用 Ctrl+V 粘贴图片。在本地终端，它从系统剪贴板读取。但在 Web 终端中，我们需要：

1. 在浏览器中拦截 Ctrl+V
2. 从浏览器剪贴板读取图片
3. 传输到容器
4. 设置容器的 X 剪贴板
5. 向 Claude Code 发送 Ctrl+V

### 容器配置

容器需要 X 剪贴板支持，即使在无头模式下：

</div>

<div class="lang-en">

### Frontend: Intercept Ctrl+V

On Mac, Cmd+V is for text paste, Ctrl+V is for image paste to Claude Code:

</div>

```javascript
const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const isImagePasteShortcut = isMac
  ? ev.key === "v" && ev.ctrlKey && !ev.metaKey && !ev.shiftKey
  : false;

if (isImagePasteShortcut && ev.type === "keydown") {
  navigator.clipboard.read().then(async (items) => {
    for (const item of items) {
      const imageType = item.types.find(type => type.startsWith("image/"));
      if (imageType) {
        const blob = await item.getType(imageType);
        // Upload to container, then send Ctrl+V
        await api.uploadClipboardImage(sessionId, blob);
        ws.send({ type: "input", data: "\x16" }); // Ctrl+V = \x16
        return;
      }
    }
    // No image found, send Ctrl+V as normal
    ws.send({ type: "input", data: "\x16" });
  });
  return false;
}
```

<div class="lang-zh">

### 前端：拦截 Ctrl+V

在 Mac 上，Cmd+V 用于文本粘贴，Ctrl+V 用于向 Claude Code 粘贴图片。

</div>

<div class="lang-en">

### Backend: Set Container Clipboard

The backend receives the image, copies it to the container, and sets the X clipboard:

</div>

```typescript
async setClipboardImage(sessionId: string, imageData: Uint8Array, mimeType: string) {
  // Ensure Xvfb is running
  await this.ensureXvfb(sessionId);

  // Copy image to container
  const tempPath = `/tmp/clipboard_${Date.now()}.png`;
  await docker.cp(imageData, `${containerName}:${tempPath}`);

  // Set clipboard using xclip in detached mode
  await docker.exec("-d", "-e", "DISPLAY=:99", containerName,
    "sh", "-c", `xclip -selection clipboard -t ${mimeType} -i ${tempPath}`);
}

async ensureXvfb(sessionId: string) {
  // Check if Xvfb already running
  const running = await docker.exec(containerName, "pgrep", "-x", "Xvfb");
  if (running) return;

  // Start Xvfb in background
  await docker.exec("-d", containerName, "Xvfb", ":99", "-screen", "0", "1024x768x24");
  await sleep(500); // Wait for Xvfb to start
}
```

<div class="lang-zh">

### 后端：设置容器剪贴板

后端接收图片，复制到容器，并设置 X 剪贴板。

</div>

<div class="lang-en">

### Critical: DISPLAY Environment Variable

The shell session must have `DISPLAY=:99` set so Claude Code can find the X clipboard:

</div>

```typescript
// When spawning the interactive shell
docker.exec("-e", "DISPLAY=:99", containerName, "tmux", "attach");
```

<div class="lang-zh">

### 关键：DISPLAY 环境变量

shell 会话必须设置 `DISPLAY=:99`，这样 Claude Code 才能找到 X 剪贴板。

</div>

<div class="lang-en">

### The xclip Persistence Problem

When you run `docker exec ... xclip -i`, xclip forks into the background to serve clipboard requests. But when docker exec exits, the forked process may be killed.

**Solution:** Use detached mode (`docker exec -d`) so xclip persists:

</div>

```typescript
// Without -d: xclip may die when docker exec returns
docker.exec("-e", "DISPLAY=:99", container, "xclip", "-i", file);

// With -d: xclip stays running to serve clipboard requests
docker.exec("-d", "-e", "DISPLAY=:99", container,
  "sh", "-c", `xclip -selection clipboard -t image/png -i ${file}`);
```

<div class="lang-zh">

### xclip 持久化问题

当运行 `docker exec ... xclip -i` 时，xclip 会 fork 到后台来响应剪贴板请求。但当 docker exec 退出时，fork 的进程可能被杀死。

**解决方案：** 使用分离模式（`docker exec -d`）让 xclip 持续运行。

</div>

<div class="lang-en">

## Complete Key Handler

Here's the full `attachCustomKeyEventHandler` implementation combining all three features:

</div>

```javascript
terminal.attachCustomKeyEventHandler((ev) => {
  // 1. Shift+Enter for multiline input
  if (ev.key === "Enter" && ev.shiftKey) {
    if (ev.type === "keydown") {
      ws.send({ type: "input", data: "\x1b\r" });
    }
    return false;
  }

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // 2. Copy: Cmd+C (Mac) or Ctrl+Shift+C (Windows/Linux)
  const isCopyShortcut = isMac
    ? ev.key === "c" && ev.metaKey && !ev.shiftKey
    : ev.key === "C" && ev.ctrlKey && ev.shiftKey;

  if (isCopyShortcut && ev.type === "keydown") {
    const selection = terminal.getSelection();
    if (selection) {
      navigator.clipboard.writeText(selection);
      return false;
    }
  }

  // 3. Text paste: Cmd+V (Mac) or Ctrl+Shift+V (Windows/Linux)
  const isPasteShortcut = isMac
    ? ev.key === "v" && ev.metaKey && !ev.shiftKey
    : ev.key === "V" && ev.ctrlKey && ev.shiftKey;

  if (isPasteShortcut && ev.type === "keydown") {
    navigator.clipboard.readText().then((text) => {
      if (text) ws.send({ type: "input", data: text });
    });
    return false;
  }

  // 4. Image paste: Ctrl+V (Mac only, for Claude Code)
  const isImagePasteShortcut = isMac && ev.key === "v" && ev.ctrlKey && !ev.metaKey;

  if (isImagePasteShortcut && ev.type === "keydown") {
    navigator.clipboard.read().then(async (items) => {
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          await api.uploadClipboardImage(sessionId, blob);
          ws.send({ type: "input", data: "\x16" });
          return;
        }
      }
      ws.send({ type: "input", data: "\x16" });
    });
    return false;
  }

  return true;
});
```

<div class="lang-zh">

## 完整的按键处理器

以下是结合三个功能的完整 `attachCustomKeyEventHandler` 实现。

</div>

<div class="lang-en">

## Key Takeaways

1. **Use native shell bindings** - Zsh's Alt+Enter (`\x1b\r`) is the right way to do multiline input.

2. **Block all event types** - When intercepting keys, return `false` for all event types (keydown, keyup, keypress), not just keydown.

3. **OSC 52 bridges the clipboard gap** - tmux's `set-clipboard on` plus xterm.js ClipboardAddon enables yank-to-clipboard.

4. **Xvfb + xclip for headless clipboard** - Containers need a virtual X server for clipboard operations.

5. **docker exec -d for persistence** - Background processes started via docker exec may die when the exec returns. Use `-d` for processes that need to persist.

</div>

<div class="lang-zh">

## 要点总结

1. **使用原生 shell 绑定** - Zsh 的 Alt+Enter（`\x1b\r`）是实现多行输入的正确方式。

2. **阻止所有事件类型** - 拦截按键时，对所有事件类型（keydown、keyup、keypress）返回 `false`，不仅仅是 keydown。

3. **OSC 52 打通剪贴板** - tmux 的 `set-clipboard on` 加上 xterm.js ClipboardAddon 实现复制到系统剪贴板。

4. **Xvfb + xclip 实现无头剪贴板** - 容器需要虚拟 X 服务器来进行剪贴板操作。

5. **docker exec -d 保持进程存活** - 通过 docker exec 启动的后台进程可能在 exec 返回时死掉。使用 `-d` 让需要持续运行的进程存活。

</div>
