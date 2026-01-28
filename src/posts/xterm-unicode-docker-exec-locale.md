---
title: "Fixing Unicode Rendering in xterm.js: It's Not the Frontend"
date: 2026-01-28
excerpt: Why Unicode characters render as underscores in web terminals, and how the real fix is passing LANG/LC_ALL to docker exec.
---

<div class="lang-en">

Building a web-based terminal using xterm.js, I encountered a frustrating issue: Unicode characters like `»` and CJK characters (你好) rendered as underscores or blank boxes. After hours of debugging font loading, WebGL renderers, and CSS font-face declarations, the fix was a single line change in the backend.

This post documents the debugging journey and the actual solution.

## The Symptom

In a web terminal powered by xterm.js connecting to Docker containers via WebSocket:

- ASCII characters rendered fine
- Unicode symbols like `»`, `→`, `←` showed as underscores
- CJK characters (Chinese, Japanese, Korean) showed as blank boxes
- The PS1 prompt `%F{63}» %f` displayed as `_` instead of `»`

## The Wrong Direction: Frontend Debugging

I spent hours trying to fix this on the frontend:

**1. Font loading attempts:**

```javascript
// Tried loading multiple fonts
fontFamily: '"JetBrains Mono", "Noto Sans Mono", "PingFang SC", monospace'

// Waited for fonts to load
await document.fonts.load('13px "JetBrains Mono"');
await document.fonts.ready;
```

**2. WebGL renderer suspicion:**

```javascript
// Disabled WebGL thinking it was the issue
// const webglAddon = new WebglAddon();
// terminal.loadAddon(webglAddon);
```

**3. CSS @font-face with unicode-range:**

```css
@font-face {
  font-family: 'TerminalFont';
  src: local('PingFang SC'), local('Microsoft YaHei');
  unicode-range: U+4E00-9FFF; /* CJK characters */
}
```

**4. Unicode11 addon:**

```javascript
const unicode11Addon = new Unicode11Addon();
terminal.loadAddon(unicode11Addon);
terminal.unicode.activeVersion = '11';
```

None of these worked.

## The Breakthrough: A Self-Contained Test

I created a standalone xterm.js demo that wrote Unicode directly to the terminal:

```javascript
terminal.writeln('Chinese: 你好世界 中文测试');
terminal.writeln('Unicode: » « → ← ↑ ↓');
```

**Result: Everything rendered perfectly.**

This proved xterm.js and WebGL were not the problem. The issue was somewhere in the data pipeline from the Docker container to the browser.

## Finding the Real Cause

I tested the Docker container directly:

```bash
docker run --rm --entrypoint /bin/sh worker:latest -c '
  echo "Direct: » 你好"
  tmux new-session -d -s test
  tmux send-keys "echo » 你好" Enter
  tmux capture-pane -p
'
```

Output showed Unicode correctly. But the container's locale was set:

```
LANG=C.UTF-8
LC_ALL=C.UTF-8
```

Then I checked how the shell was being spawned. The `docker exec` command was:

```javascript
const dockerCmd = [
  "/usr/bin/docker",
  "exec",
  "-it",
  "-e", "TERM=xterm-256color",
  containerName,
  "/bin/sh", "-c", tmuxCmd,
];
```

**The problem:** `TERM` was set, but `LANG` and `LC_ALL` were not passed to the exec environment. Even though the container had these set in the Dockerfile, `docker exec` creates a new environment that doesn't inherit all container environment variables.

## The Fix

Add `LANG` and `LC_ALL` to the docker exec command:

```javascript
const dockerCmd = [
  "/usr/bin/docker",
  "exec",
  "-it",
  "-e", "TERM=xterm-256color",
  "-e", "LANG=C.UTF-8",
  "-e", "LC_ALL=C.UTF-8",
  containerName,
  "/bin/sh", "-c", tmuxCmd,
];
```

**That's it.** Unicode rendering worked immediately.

## Why This Happens

1. **Container environment ≠ exec environment**: Setting `ENV LANG=C.UTF-8` in Dockerfile sets the variable for processes started by the container's entrypoint. But `docker exec` creates a new process with a minimal environment.

2. **Shell needs locale for Unicode**: Without `LANG`/`LC_ALL`, the shell (zsh/bash) may not properly handle multi-byte characters. It might output escape sequences or replacement characters instead.

3. **The browser receives corrupted data**: By the time the data reaches xterm.js via WebSocket, the Unicode characters are already mangled at the source.

## Diagnostic Checklist

When debugging Unicode issues in web terminals:

1. **Test xterm.js in isolation** - Write Unicode directly to terminal. If it renders, the frontend is fine.

2. **Test the container directly** - Run `echo "你好"` via `docker exec` in a regular terminal.

3. **Check the exec environment** - Print `$LANG` and `$LC_ALL` in the exec session, not just `docker inspect`.

4. **Verify the data pipeline** - Log the raw bytes at each stage (container → API → WebSocket → browser).

## Key Takeaway

When Unicode doesn't render in a web terminal:

- It's probably **not** xterm.js
- It's probably **not** font loading
- It's probably **not** the WebGL renderer

Check how the shell process is spawned. Specifically, verify that `LANG` and `LC_ALL` are set to a UTF-8 locale in the exec environment, not just in the container's Dockerfile.

</div>

<div class="lang-zh">

在使用 xterm.js 构建 Web 终端时，我遇到了一个令人沮丧的问题：Unicode 字符如 `»` 和中日韩字符（你好）渲染成下划线或空白方块。在花了数小时调试字体加载、WebGL 渲染器和 CSS font-face 声明后，最终的修复只是后端的一行代码改动。

本文记录了调试过程和真正的解决方案。

## 症状

在一个通过 WebSocket 连接到 Docker 容器的 xterm.js Web 终端中：

- ASCII 字符正常渲染
- Unicode 符号如 `»`、`→`、`←` 显示为下划线
- 中日韩字符显示为空白方块
- PS1 提示符 `%F{63}» %f` 显示为 `_` 而不是 `»`

## 错误的方向：前端调试

我花了数小时试图在前端修复这个问题：

**1. 字体加载尝试：**

```javascript
// 尝试加载多种字体
fontFamily: '"JetBrains Mono", "Noto Sans Mono", "PingFang SC", monospace'

// 等待字体加载
await document.fonts.load('13px "JetBrains Mono"');
await document.fonts.ready;
```

**2. 怀疑 WebGL 渲染器：**

```javascript
// 禁用 WebGL，以为是它的问题
// const webglAddon = new WebglAddon();
// terminal.loadAddon(webglAddon);
```

**3. 使用 unicode-range 的 CSS @font-face：**

```css
@font-face {
  font-family: 'TerminalFont';
  src: local('PingFang SC'), local('Microsoft YaHei');
  unicode-range: U+4E00-9FFF; /* CJK 字符 */
}
```

**4. Unicode11 插件：**

```javascript
const unicode11Addon = new Unicode11Addon();
terminal.loadAddon(unicode11Addon);
terminal.unicode.activeVersion = '11';
```

这些都没有用。

## 突破口：独立测试

我创建了一个独立的 xterm.js 演示，直接向终端写入 Unicode：

```javascript
terminal.writeln('Chinese: 你好世界 中文测试');
terminal.writeln('Unicode: » « → ← ↑ ↓');
```

**结果：一切渲染完美。**

这证明了 xterm.js 和 WebGL 不是问题所在。问题在于从 Docker 容器到浏览器的数据传输管道中的某个环节。

## 找到真正的原因

我直接测试了 Docker 容器：

```bash
docker run --rm --entrypoint /bin/sh worker:latest -c '
  echo "Direct: » 你好"
  tmux new-session -d -s test
  tmux send-keys "echo » 你好" Enter
  tmux capture-pane -p
'
```

输出正确显示了 Unicode。容器的 locale 设置如下：

```
LANG=C.UTF-8
LC_ALL=C.UTF-8
```

然后我检查了 shell 是如何启动的。`docker exec` 命令是：

```javascript
const dockerCmd = [
  "/usr/bin/docker",
  "exec",
  "-it",
  "-e", "TERM=xterm-256color",
  containerName,
  "/bin/sh", "-c", tmuxCmd,
];
```

**问题所在：** 设置了 `TERM`，但没有传递 `LANG` 和 `LC_ALL` 到 exec 环境。尽管容器在 Dockerfile 中设置了这些变量，`docker exec` 会创建一个新环境，不会继承所有容器环境变量。

## 修复方法

在 docker exec 命令中添加 `LANG` 和 `LC_ALL`：

```javascript
const dockerCmd = [
  "/usr/bin/docker",
  "exec",
  "-it",
  "-e", "TERM=xterm-256color",
  "-e", "LANG=C.UTF-8",
  "-e", "LC_ALL=C.UTF-8",
  containerName,
  "/bin/sh", "-c", tmuxCmd,
];
```

**就这样。** Unicode 渲染立即正常了。

## 为什么会这样

1. **容器环境 ≠ exec 环境**：在 Dockerfile 中设置 `ENV LANG=C.UTF-8` 只对容器入口点启动的进程生效。但 `docker exec` 会创建一个带有最小环境的新进程。

2. **Shell 需要 locale 支持 Unicode**：没有 `LANG`/`LC_ALL`，shell（zsh/bash）可能无法正确处理多字节字符，会输出转义序列或替换字符。

3. **浏览器收到的是损坏的数据**：当数据通过 WebSocket 到达 xterm.js 时，Unicode 字符在源头就已经被破坏了。

## 诊断清单

调试 Web 终端的 Unicode 问题时：

1. **单独测试 xterm.js** - 直接向终端写入 Unicode。如果能渲染，前端没问题。

2. **直接测试容器** - 在普通终端中通过 `docker exec` 运行 `echo "你好"`。

3. **检查 exec 环境** - 在 exec 会话中打印 `$LANG` 和 `$LC_ALL`，而不只是 `docker inspect`。

4. **验证数据管道** - 在每个阶段记录原始字节（容器 → API → WebSocket → 浏览器）。

## 关键要点

当 Web 终端中 Unicode 无法渲染时：

- **可能不是** xterm.js 的问题
- **可能不是**字体加载的问题
- **可能不是** WebGL 渲染器的问题

检查 shell 进程是如何启动的。具体来说，验证 `LANG` 和 `LC_ALL` 在 exec 环境中是否设置为 UTF-8 locale，而不仅仅是在容器的 Dockerfile 中。

</div>
