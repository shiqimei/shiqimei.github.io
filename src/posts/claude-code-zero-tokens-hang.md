---
title: "Fixing Claude Code \"0 Tokens\" Hang: macOS Proxy and SSE Streaming"
date: 2026-01-05
excerpt: Why Claude Code hangs at "0 tokens" when macOS has disabled-but-configured proxy settings that interfere with SSE streaming.
---

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
