---
title: "Fixing Claude Code \"0 Tokens\" Hang: macOS Proxy and SSE Streaming"
date: 2025-12-16
excerpt: Why Claude Code hangs at "0 tokens" when macOS has disabled-but-configured proxy settings that interfere with SSE streaming.
---

<div class="lang-en">

Claude Code v2.0.70 (with Opus 4.5 on Claude Max) would hang indefinitely on the first message of each session. The status would show "Simmering...", "Pontificating...", etc., while the token counter stayed at 0 tokens. The timer kept running for 15+ minutes with no error messages. However, after interrupting with ESC and retrying, Claude Code would respond normally.

This post documents the root cause and solutions.

## Root Cause

The issue stemmed from macOS network proxy settings combined with Clash proxy injection.

### The Problem Chain

**1. macOS had proxy settings configured but disabled:**

```bash
networksetup -getwebproxy Wi-Fi
Enabled: No          # Proxy is "disabled"
Server: 127.0.0.1    # But server address still configured
Port: 7897
```

**2. Clash was reading this config** and injecting proxy environment variables into terminal sessions:

```bash
HTTP_PROXY=http://127.0.0.1:7897
HTTPS_PROXY=http://127.0.0.1:7897
```

**3. Claude Code respects these proxy env vars** and routes API requests through the proxy.

**4. The proxy wasn't properly handling SSE (Server-Sent Events) streaming:**

- Claude Code uses SSE for real-time token streaming
- Clash buffers streaming responses before forwarding
- Claude Code waits for tokens that never arrive (stuck at "0 tokens")

## Solutions

### Solution 1: Clear macOS Proxy Config Entirely

Remove the proxy server settings completely, not just disable them:

```bash
networksetup -setwebproxy Wi-Fi "" "" off
networksetup -setsecurewebproxy Wi-Fi "" "" off
```

### Solution 2: Bypass Proxy for Anthropic Domains

Add to `~/.zshrc` or `~/.zshenv`:

```bash
export NO_PROXY="api.anthropic.com,claude.ai,statsig.anthropic.com,sentry.io,localhost,127.0.0.1"
export no_proxy="$NO_PROXY"
```

Then reload:

```bash
source ~/.zshrc
```

## Diagnostic Commands

```bash
# Check proxy env vars
echo $HTTP_PROXY $HTTPS_PROXY

# Check macOS network proxy config
networksetup -getwebproxy Wi-Fi
networksetup -getsecurewebproxy Wi-Fi

# Test direct connection to Anthropic
curl -4 -v --connect-timeout 5 https://api.anthropic.com

# Test connection bypassing proxy
unset HTTP_PROXY HTTPS_PROXY
curl -v --connect-timeout 5 https://api.anthropic.com

# Run Claude with debug
claude --debug
```

## Key Takeaway

The proxy was "disabled" in macOS UI but the server address remained configured. Clash read this config and injected proxy env vars into terminal sessions. Claude Code tried to route through a proxy that wasn't handling streaming connections properly, causing the "0 tokens" hang.

When debugging similar issues, check both the macOS system proxy settings and any proxy environment variables in your shell. A "disabled" proxy with residual configuration can still affect CLI tools.

</div>

<div class="lang-zh">

Claude Code v2.0.70（使用 Claude Max 上的 Opus 4.5）会在每次会话的第一条消息上无限挂起。状态会显示 "Simmering..."、"Pontificating..." 等，而 token 计数器保持在 0 tokens。计时器运行超过 15 分钟没有错误消息。然而，用 ESC 中断并重试后，Claude Code 会正常响应。

本文记录了根本原因和解决方案。

## 根本原因

问题源于 macOS 网络代理设置与 Clash 代理注入的结合。

### 问题链

**1. macOS 代理设置已配置但被禁用：**

```bash
networksetup -getwebproxy Wi-Fi
Enabled: No          # 代理已"禁用"
Server: 127.0.0.1    # 但服务器地址仍然配置着
Port: 7897
```

**2. Clash 读取了这个配置**并将代理环境变量注入到终端会话中：

```bash
HTTP_PROXY=http://127.0.0.1:7897
HTTPS_PROXY=http://127.0.0.1:7897
```

**3. Claude Code 遵守这些代理环境变量**并通过代理路由 API 请求。

**4. 代理没有正确处理 SSE（Server-Sent Events）流：**

- Claude Code 使用 SSE 进行实时 token 流式传输
- Clash 在转发之前缓冲流式响应
- Claude Code 等待永远不会到达的 token（卡在 "0 tokens"）

## 解决方案

### 方案 1：完全清除 macOS 代理配置

完全移除代理服务器设置，而不仅仅是禁用它们：

```bash
networksetup -setwebproxy Wi-Fi "" "" off
networksetup -setsecurewebproxy Wi-Fi "" "" off
```

### 方案 2：为 Anthropic 域名绕过代理

添加到 `~/.zshrc` 或 `~/.zshenv`：

```bash
export NO_PROXY="api.anthropic.com,claude.ai,statsig.anthropic.com,sentry.io,localhost,127.0.0.1"
export no_proxy="$NO_PROXY"
```

然后重新加载：

```bash
source ~/.zshrc
```

## 诊断命令

```bash
# 检查代理环境变量
echo $HTTP_PROXY $HTTPS_PROXY

# 检查 macOS 网络代理配置
networksetup -getwebproxy Wi-Fi
networksetup -getsecurewebproxy Wi-Fi

# 测试到 Anthropic 的直接连接
curl -4 -v --connect-timeout 5 https://api.anthropic.com

# 测试绕过代理的连接
unset HTTP_PROXY HTTPS_PROXY
curl -v --connect-timeout 5 https://api.anthropic.com

# 使用调试模式运行 Claude
claude --debug
```

## 关键要点

代理在 macOS UI 中是"禁用"的，但服务器地址仍然配置着。Clash 读取了这个配置并将代理环境变量注入到终端会话中。Claude Code 尝试通过一个没有正确处理流式连接的代理进行路由，导致 "0 tokens" 挂起。

调试类似问题时，检查 macOS 系统代理设置和 shell 中的任何代理环境变量。带有残留配置的"禁用"代理仍然会影响 CLI 工具。

</div>
