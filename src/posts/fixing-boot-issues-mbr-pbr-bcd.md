---
title: "Fixing Boot Issues: A Deep Dive into MBR, PBR, and BCD"
date: 2018-02-21
excerpt: Understanding and repairing Windows boot failures after removing a Linux dual-boot partition.
---

<div class="lang-en">

I was recently dual-booting Windows 10 and Linux. When I decided to remove Linux, I simply formatted the Linux partition from Windows PE. Bad idea. After reboot, I was greeted with `grub rescue>`. Time to learn how boot systems actually work.

## The Problem

When you install Linux alongside Windows, GRUB (the Linux bootloader) takes over the MBR. GRUB stores part of itself in the MBR and its configuration files in the Linux partition at `/boot/grub/`. When you delete the Linux partition, you're deleting GRUB's configuration files, but GRUB is still in the MBR trying to load them.

## Understanding the Boot Process

### Key Concepts

**MBR (Master Boot Record)**

The first 512 bytes of a hard disk, containing:

- **Boot Loader** (446 bytes): Initial boot code
- **DPT - Disk Partition Table** (64 bytes): Partition information (max 4 primary partitions)
- **Magic Number** (2 bytes): Boot signature `55 AA`

**PBR (Partition Boot Record)**

Located at the start of each bootable partition. Contains code to load the OS bootloader (like `bootmgr` for Windows).

**BCD (Boot Configuration Data)**

Windows boot configuration file, replacing the old `boot.ini`. Located at `\boot\bcd` on the system partition.

### Windows Boot Sequence

```text
BIOS → MBR → PBR → bootmgr → BCD → winload.exe → Windows Kernel
```

### Linux Boot Sequence

```text
BIOS → MBR (GRUB Stage 1) → PBR → GRUB Stage 2 → grub.cfg → Linux Kernel
```

### How GRUB Boots Windows

When dual-booting, GRUB chainloads Windows by handing control to `bootmgr`:

```text
BIOS → MBR (GRUB) → PBR → bootmgr → BCD → Windows
```

## Attempting Recovery from grub rescue

First, I tried recovering from the `grub rescue>` prompt:

```bash
# List all partitions
ls
# Output: (hd0)(hd0,msdos1)(hd1)(hd1,msdos3)(hd1,msdos2)(hd1,msdos1)

# Find the partition with GRUB files
ls (hd0,msdos1)/boot/grub
ls (hd1,msdos1)/boot/grub
# Looking for a partition that doesn't return "error:unknown filesystem"

# If found, set root and boot
set root=(hd1,msdos1)/boot/grub
set prefix=(hd1,msdos1)/boot/grub
insmod normal
normal
```

This didn't work for me - all partitions returned `error:unknown filesystem` because the Linux partition was gone.

## The Solution: Rebuild the Boot Chain

I booted into Windows PE and used these tools (commonly included in PE environments):

- **DiskGenius**: Rebuild MBR
- **BCDrepair**: Fix BCD files
- **Bootice**: Rebuild MBR, PBR, edit BCD
- **NTBoot**: Automatic boot repair

### Step 1: Rewrite MBR with Bootice

Open Bootice, select your disk, click "Process MBR", and choose "Windows NT 5.x/6.x MBR". This replaces GRUB with the Windows MBR.

### Step 2: Rewrite PBR with Bootice

In Bootice, select your Windows partition, click "Process PBR", and choose "BOOTMGR boot record". This ensures the PBR points to `bootmgr`.

### Step 3: Repair BCD with BCDrepair

Run BCDrepair and let it automatically fix the BCD file. This ensures Windows knows where to find `winload.exe`.

## Summary

The Windows boot chain has three critical components:

| Component | Location | Purpose |
|-----------|----------|---------|
| MBR | First 512 bytes of disk | Find and load PBR |
| PBR | Start of system partition | Load bootmgr |
| BCD | \boot\bcd | Configure boot options |

When removing a Linux dual-boot, always restore the Windows MBR first, or use the Windows installation media's repair option to avoid these issues entirely.

</div>

<div class="lang-zh">

我最近在双启动 Windows 10 和 Linux。当我决定移除 Linux 时，我只是从 Windows PE 格式化了 Linux 分区。糟糕的决定。重启后，我看到了 `grub rescue>`。是时候学习启动系统实际是如何工作的了。

## 问题

当你在 Windows 旁边安装 Linux 时，GRUB（Linux 引导程序）会接管 MBR。GRUB 将自身的一部分存储在 MBR 中，配置文件存储在 Linux 分区的 `/boot/grub/`。当你删除 Linux 分区时，你删除了 GRUB 的配置文件，但 GRUB 仍然在 MBR 中试图加载它们。

## 理解启动过程

### 关键概念

**MBR（主引导记录）**

硬盘的前 512 字节，包含：

- **引导加载程序**（446 字节）：初始引导代码
- **DPT - 磁盘分区表**（64 字节）：分区信息（最多 4 个主分区）
- **魔数**（2 字节）：引导签名 `55 AA`

**PBR（分区引导记录）**

位于每个可引导分区的开头。包含加载操作系统引导程序（如 Windows 的 `bootmgr`）的代码。

**BCD（引导配置数据）**

Windows 引导配置文件，替代旧的 `boot.ini`。位于系统分区的 `\boot\bcd`。

### Windows 引导序列

```text
BIOS → MBR → PBR → bootmgr → BCD → winload.exe → Windows 内核
```

### Linux 引导序列

```text
BIOS → MBR (GRUB Stage 1) → PBR → GRUB Stage 2 → grub.cfg → Linux 内核
```

### GRUB 如何引导 Windows

双启动时，GRUB 通过将控制权交给 `bootmgr` 来链式加载 Windows：

```text
BIOS → MBR (GRUB) → PBR → bootmgr → BCD → Windows
```

## 尝试从 grub rescue 恢复

首先，我尝试从 `grub rescue>` 提示符恢复：

```bash
# 列出所有分区
ls
# 输出: (hd0)(hd0,msdos1)(hd1)(hd1,msdos3)(hd1,msdos2)(hd1,msdos1)

# 查找包含 GRUB 文件的分区
ls (hd0,msdos1)/boot/grub
ls (hd1,msdos1)/boot/grub
# 寻找不返回 "error:unknown filesystem" 的分区

# 如果找到，设置 root 并引导
set root=(hd1,msdos1)/boot/grub
set prefix=(hd1,msdos1)/boot/grub
insmod normal
normal
```

这对我不起作用——所有分区都返回 `error:unknown filesystem`，因为 Linux 分区已经不存在了。

## 解决方案：重建引导链

我启动进入 Windows PE 并使用这些工具（通常包含在 PE 环境中）：

- **DiskGenius**：重建 MBR
- **BCDrepair**：修复 BCD 文件
- **Bootice**：重建 MBR、PBR，编辑 BCD
- **NTBoot**：自动引导修复

### 步骤 1：使用 Bootice 重写 MBR

打开 Bootice，选择你的磁盘，点击 "Process MBR"，选择 "Windows NT 5.x/6.x MBR"。这会用 Windows MBR 替换 GRUB。

### 步骤 2：使用 Bootice 重写 PBR

在 Bootice 中，选择你的 Windows 分区，点击 "Process PBR"，选择 "BOOTMGR boot record"。这确保 PBR 指向 `bootmgr`。

### 步骤 3：使用 BCDrepair 修复 BCD

运行 BCDrepair 让它自动修复 BCD 文件。这确保 Windows 知道在哪里找到 `winload.exe`。

## 总结

Windows 引导链有三个关键组件：

| 组件 | 位置 | 用途 |
|-----|------|-----|
| MBR | 磁盘前 512 字节 | 查找并加载 PBR |
| PBR | 系统分区开头 | 加载 bootmgr |
| BCD | \boot\bcd | 配置引导选项 |

移除 Linux 双启动时，始终先恢复 Windows MBR，或使用 Windows 安装介质的修复选项来完全避免这些问题。

</div>
