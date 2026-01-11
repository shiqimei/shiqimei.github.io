---
title: Deepin Boot Maker Not Recognizing USB Drive
date: 2018-02-21
excerpt: Why PE tools cause USB drives to be misidentified as local disks, and how to work around it.
---

<div class="lang-en">

After using a Windows PE tool to create a bootable USB drive, I found that the Deepin Boot Maker could no longer detect my USB drive. Formatting the drive, restarting the computer - nothing worked. Here's what was happening and how to fix it.

## The Problem

When you create a PE bootable drive with certain tools, Windows may start recognizing your USB drive as a "Local Disk" instead of a "Removable Disk". The Deepin Boot Maker (and many other Linux boot disk creators) intentionally ignore local disks to prevent accidentally overwriting your system drive.

You can verify this in Windows Disk Management (Win+X → Disk Management). If your USB drive shows as "Basic" disk instead of "Removable", that's the issue.

## Why This Happens

USB drives can operate in two modes:

- **Removable Media Mode**: Normal USB drive behavior, recognized as removable storage
- **Fixed Disk Mode**: Drive behaves like an internal hard disk

Some PE creation tools modify the USB drive's mode to Fixed Disk to support features like multiple partitions. Once in this mode, Windows treats it as a local disk.

## The Solution

The workaround is to run Deepin Boot Maker from within a PE environment, where the disk filtering behavior is different:

1. Download Deepin Boot Maker for PE environments
2. Create a bootable PE drive using your preferred PE tool (the same one that caused the issue works fine)
3. Boot into the PE environment
4. Run `deepin-boot-maker.exe` from within PE
5. The USB drive should now be visible and selectable

## Important Notes

- This solution only applies when the USB was previously converted to Fixed Disk mode by PE creation tools
- Some USB drives (notably certain SanDisk models) ship in Fixed Disk mode by default - these may not work with Deepin Boot Maker at all
- If your USB drive isn't recognized even in PE, the drive may be defective or permanently configured as a fixed disk

## Alternative: Reset USB to Removable Mode

On some USB drives, you can reset to removable mode using the `diskpart` command, though this doesn't work on all drives:

```bash
# Run as Administrator
diskpart
list disk
select disk X    # Replace X with your USB disk number
clean
create partition primary
format fs=fat32 quick
exit
```

If the drive still shows as "Basic" instead of "Removable" after this, the PE environment workaround is your best option.

</div>

<div class="lang-zh">

使用 Windows PE 工具创建可启动 USB 驱动器后，我发现 Deepin 启动盘制作工具无法再检测到我的 USB 驱动器。格式化驱动器、重启电脑——都没用。以下是发生的情况以及如何修复。

## 问题

当你使用某些工具创建 PE 可启动驱动器时，Windows 可能会开始将你的 USB 驱动器识别为"本地磁盘"而不是"可移动磁盘"。Deepin 启动盘制作工具（以及许多其他 Linux 启动盘创建工具）故意忽略本地磁盘，以防止意外覆盖你的系统驱动器。

你可以在 Windows 磁盘管理中验证这一点（Win+X → 磁盘管理）。如果你的 USB 驱动器显示为"基本"磁盘而不是"可移动"，那就是问题所在。

## 为什么会这样

USB 驱动器可以在两种模式下运行：

- **可移动媒体模式**：正常的 USB 驱动器行为，被识别为可移动存储
- **固定磁盘模式**：驱动器表现得像内部硬盘

一些 PE 创建工具将 USB 驱动器的模式修改为固定磁盘，以支持多分区等功能。一旦进入此模式，Windows 就会将其视为本地磁盘。

## 解决方案

解决方法是在 PE 环境中运行 Deepin 启动盘制作工具，那里的磁盘过滤行为不同：

1. 下载 PE 环境版本的 Deepin 启动盘制作工具
2. 使用你喜欢的 PE 工具创建可启动 PE 驱动器（导致问题的同一个工具也可以）
3. 启动进入 PE 环境
4. 在 PE 中运行 `deepin-boot-maker.exe`
5. USB 驱动器现在应该可见并可选择

## 重要说明

- 此解决方案仅适用于 USB 之前被 PE 创建工具转换为固定磁盘模式的情况
- 一些 USB 驱动器（特别是某些 SanDisk 型号）默认以固定磁盘模式出厂——这些可能根本无法与 Deepin 启动盘制作工具配合使用
- 如果你的 USB 驱动器即使在 PE 中也无法识别，该驱动器可能有缺陷或被永久配置为固定磁盘

## 替代方案：将 USB 重置为可移动模式

在某些 USB 驱动器上，你可以使用 `diskpart` 命令重置为可移动模式，但这并非对所有驱动器都有效：

```bash
# 以管理员身份运行
diskpart
list disk
select disk X    # 将 X 替换为你的 USB 磁盘编号
clean
create partition primary
format fs=fat32 quick
exit
```

如果驱动器在此之后仍显示为"基本"而不是"可移动"，PE 环境解决方法是你的最佳选择。

</div>
