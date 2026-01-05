---
title: Deepin Boot Maker Not Recognizing USB Drive
date: 2018-02-21
excerpt: Why PE tools cause USB drives to be misidentified as local disks, and how to work around it.
---

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
