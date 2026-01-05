---
title: "Fixing Boot Issues: A Deep Dive into MBR, PBR, and BCD"
date: 2018-02-21
excerpt: Understanding and repairing Windows boot failures after removing a Linux dual-boot partition.
---

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
