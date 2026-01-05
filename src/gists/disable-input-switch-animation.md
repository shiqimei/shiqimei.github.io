---
title: Disable Input Method Switch Animation
date: 2026-01-04
excerpt: Disable the slow input source popup on macOS Sonoma+
---

Disable the slow input source popup on macOS Sonoma+:

```bash
defaults write kCFPreferencesAnyApplication TSMLanguageIndicatorEnabled 0
```

Restart to apply. To revert, delete the key or set to 1.
