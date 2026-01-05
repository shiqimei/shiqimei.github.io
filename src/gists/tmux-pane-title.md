---
title: Set Default Tmux Pane Title
date: 2026-01-04
excerpt: Stop tmux from showing hostname as pane title using session-created hook
---

Stop tmux from showing hostname as pane title:

```bash
set-hook -g session-created 'select-pane -T "tmux"'
set-hook -g after-new-window 'select-pane -T "tmux"'
set-hook -g after-split-window 'select-pane -T "tmux"'
```
