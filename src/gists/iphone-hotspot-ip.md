---
title: Get iPhone Hotspot Gateway IP
date: 2026-01-03
excerpt: Get the gateway IP when using an iPhone as a hotspot
---

When using an iPhone as a hotspot, get the gateway IP:

```bash
route -n get default | grep gateway
```

Output:

```text
    gateway: 192.168.3.37
```
