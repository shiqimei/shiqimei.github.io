---
title: "rsync --fuzzy + gzip --rsyncable: Cutting Release Uploads 6× at the Same Bandwidth"
date: 2026-04-17
excerpt: Our publish pipeline hit a 2.5 Mbps VPS bandwidth cap. We cut upload time from 20s to 3.4s without changing the pipe — by combining gzip --rsyncable with rsync --fuzzy against versioned tarballs.
---

<div class="lang-en">

Our release pipeline publishes versioned tarballs (`ouro-app-0.1.12.tar.gz`, `ouro-app-0.1.13.tar.gz`, ...) through an frp relay on a Tencent Cloud VPS. That VPS is bandwidth-capped at around 2.5 Mbps — a 6.6 MB tarball takes 20+ seconds to upload. Every `bun pub:app` pays that cost.

Upgrading VPS bandwidth costs money. Moving to a different cloud failed: our org firewall blocked Aliyun IPs. Running frp XTCP P2P between two China Telecom endpoints failed during UDP hole-punching (CGNAT drops the NAT-bust packets). We were stuck with 2.5 Mbps.

So we looked upstream: **if we can't make the pipe fatter, push fewer bytes through it.**

## Why Naive rsync Doesn't Help

First instinct: replace `scp` with `rsync`. Rsync's rolling checksum should send only the diff between two versions of the tarball.

It doesn't. Two separate issues stack on top of each other:

**1. Different filenames defeat rsync's default basis detection.**

Rsync looks for a file of the same name on the destination to use as a delta basis. But our tarballs are versioned — `ouro-app-0.1.12.tar.gz` and `ouro-app-0.1.13.tar.gz` are different filenames, so rsync treats the new one as a fresh file and sends the whole thing.

**2. gzip's DEFLATE state breaks byte-level delta.**

Even if you force rsync to compare against the old tarball, gzip's compression carries state across the entire stream. A single byte change in the input cascades into completely different output from that point to EOF. Rsync's rolling checksum sees two mostly-different byte streams and ends up re-transferring 80–90% of the file. You get the overhead of delta computation with none of the benefit.

## Two Flags Fix Both

**`gzip --rsyncable`** inserts flush points at content-defined boundaries, so a small input change produces a localized output change. The file gets about 1% larger; the DEFLATE state resets regularly.

**`rsync --fuzzy`** tells rsync: if the destination doesn't have a same-named file, look in the same directory for files with similar names, pick the closest one, and use it as a delta basis. `ouro-app-0.1.12.tar.gz` becomes a viable basis for `ouro-app-0.1.13.tar.gz`. Double `--fuzzy --fuzzy` also enables fuzzy matching across `--compare-dest` directories.

Neither flag alone is sufficient:

- `--rsyncable` without `--fuzzy`: rsync doesn't find a basis, transfers the whole file.
- `--fuzzy` without `--rsyncable`: rsync picks a basis but the gzip stream difference is too large to exploit.

Both together: delta becomes tiny and usable.

## The Measurement

Same Tencent relay, same 2.5 Mbps cap, same 6.71 MB `ouro-app-0.1.X.tar.gz`:

</div>

| Run | Transferred | Time | Throughput |
|-----|-------------|------|------------|
| Full upload (no delta) | 6.71 MB (100%) | 20.00s | 0.33 MB/s |
| rsync --fuzzy + --rsyncable | **1.02 MB (15.2%)** | **3.38s** | 0.30 MB/s |

<div class="lang-en">

Throughput is identical because the pipe is still 2.5 Mbps. The win is that rsync only had to push 15% of the file. Upload time dropped **6×** at the same bandwidth.

The 15% figure is the interesting part. There were **zero code changes** between these two versions — the only diff in the source tree was the `package.json` version string (`0.1.1` → `0.1.2`). Everything else was byte-identical. So why did a full megabyte still change?

Because:

1. Bun's bundler embeds the version string into `server.js`.
2. `tar` preserves file mtimes by default; each build run has different mtimes.
3. `gzip --rsyncable` still produces slightly different output for identical input if internal flush alignment shifts.

In production with real incremental code changes, deltas land in the same 10–20% range. At 2.5 Mbps that's the difference between 20 seconds and 3 seconds per publish.

## Three Things You Actually Need

For this to work end-to-end:

### 1. Compress with `--rsyncable`

Pipe `tar` into a rsync-aware compressor. All three of `gzip`, `pigz`, and `zstd` support `--rsyncable`:

</div>

```bash
tar -c -C dist/ . | gzip -9 --rsyncable > ouro-app-$VERSION.tar.gz
# or, faster:
tar -c -C dist/ . | pigz -9 --rsyncable > ouro-app-$VERSION.tar.gz
# or, smaller files:
tar -c -C dist/ . | zstd -19 --rsyncable > ouro-app-$VERSION.tar.zst
```

<div class="lang-en">

If you use Apple's `/usr/bin/gzip` or BusyBox gzip, you don't get this flag. On macOS, install GNU gzip:

</div>

```bash
brew install gzip
```

<div class="lang-en">

### 2. Upload with `rsync --fuzzy --fuzzy --inplace --partial`

`--inplace` is required so the delta lands in the destination file directly instead of a temp file. `--partial` keeps partially-transferred files so an interrupted upload resumes:

</div>

```bash
rsync -a --fuzzy --fuzzy --inplace --partial --stats \
  dist/ouro-app-$VERSION.tar.gz \
  dell:~/releases/ouro/
```

<div class="lang-en">

macOS ships `openrsync`, a BSD rewrite that claims rsync 2.6.9 compatibility but is missing `--fuzzy`. Install GNU rsync:

</div>

```bash
brew install rsync
```

<div class="lang-en">

### 3. Prune old versions AFTER upload, not before

If your pipeline deletes old tarballs before pushing the new one, rsync has no basis to match against and you pay full price. Keep at least the previous version on the destination until after the upload succeeds.

## The Bun Implementation

Our `publish.ts` used Bun shell templates. The swap from `scp` to `rsync` looked like this:

</div>

```typescript
const SSH_OPTS = [
  "-o", "ControlMaster=auto",
  "-o", "ControlPath=/tmp/op/%C",
  "-o", "ControlPersist=60",
];
const RSYNC_SSH = `ssh ${SSH_OPTS.join(" ")}`;

const out = await $`rsync -a --fuzzy --fuzzy --inplace --partial --stats \
  -e ${RSYNC_SSH} ${localPath} ${sshHost}:${remoteDir}/`.text();

// Parse "Total bytes sent: 1,234,567" from --stats output
const m = out.match(/Total bytes sent:\s*([\d,]+)/);
const sent = m ? Number(m[1].replace(/,/g, "")) : size;
const deltaPct = ((sent / size) * 100).toFixed(1);

console.log(`${name}: ${elapsed}ms, sent ${sent} / ${size} (${deltaPct}%)`);
```

<div class="lang-en">

Parsing `--stats` output lets us print a real measurement on every publish:

</div>

```
[ OK ]  ouro-app-0.1.2.tar.gz: 3.38s, sent 1.02 MB / 6.71 MB (15.2%, 0.30 MB/s)
[ OK ]  Published app v0.1.2 in 45s
```

<div class="lang-en">

## When This Doesn't Help

- **First publish of a release lineage.** No prior version to diff against — first publish pays full price, subsequent ones are cheap.
- **Docker image tarballs.** `docker save` produces deterministic layer files but the containing tar interleaves them; small image changes can still cause large tarball diffs. Use a Docker registry instead — `docker push` already does delta transfer via layer digests.
- **If you already have a fast pipe.** At 100 Mbps the 20s → 3s difference is 0.2s → 0.03s and nobody cares. The technique matters when bandwidth is the constraint.

## Takeaway

The fastest byte to transfer is the one you don't transfer. Before throwing money at a bandwidth upgrade or reaching for a fancier sync tool (mutagen, syncthing, casync), try:

1. `gzip --rsyncable` in the build pipeline.
2. `rsync --fuzzy --fuzzy --inplace --partial` on the upload.
3. Prune after upload, not before.

Three flag changes. No new services, no new dependencies, no VPS upgrade. 6× faster publishes at the same cost.

</div>

<div class="lang-zh">

我们的发布流水线会把版本化的 tarball（`ouro-app-0.1.12.tar.gz`、`ouro-app-0.1.13.tar.gz`……）通过腾讯云 VPS 上的 frp 中继推送出去。那台 VPS 的带宽被限制在 2.5 Mbps 左右——一个 6.6 MB 的 tarball 要传 20 秒以上。每次 `bun pub:app` 都要付这笔时间。

升级 VPS 带宽要花钱。换云也走不通：公司的防火墙把阿里云 IP 给封了。试过 frp XTCP P2P 打洞，但两端都在电信 CGNAT 后面，UDP 握手包被运营商丢掉了。2.5 Mbps 的管道没法变宽。

那就换个角度：**管道不能变粗，那就让数据变少。**

## 为什么直接换 rsync 不管用

第一反应：把 `scp` 换成 `rsync`。rsync 的滚动校验应该只传两个版本 tarball 之间的差异才对。

但它不管用，而且是两个问题叠加在一起：

**1. 文件名不同，rsync 默认找不到对比基准。**

rsync 会在目标机器上找同名文件作为增量对比的基准。但我们的 tarball 带版本号——`ouro-app-0.1.12.tar.gz` 和 `ouro-app-0.1.13.tar.gz` 文件名不同，rsync 会把新文件当成全新文件，整份传过去。

**2. gzip 的 DEFLATE 状态破坏了字节级的增量。**

就算强行让 rsync 对比旧 tarball，gzip 的压缩状态贯穿整个流。输入里改一个字节，从改动点到文件末尾的输出字节就全都变了。rsync 的滚动校验看到两个大部分不同的字节流，最后会重传 80–90% 的文件。你付出了增量计算的开销，却拿不到增量传输的收益。

## 两个参数解决两个问题

**`gzip --rsyncable`** 会在内容相关的边界插入刷新点，让输入的小改动只影响输出的局部。文件会大 1% 左右，但 DEFLATE 状态会定期重置。

**`rsync --fuzzy`** 告诉 rsync：如果目标位置没有同名文件，就在同一目录下找文件名相似的文件，挑最接近的那个作为增量对比基准。`ouro-app-0.1.12.tar.gz` 就可以作为 `ouro-app-0.1.13.tar.gz` 的基准。双写 `--fuzzy --fuzzy` 还会在 `--compare-dest` 指定的目录里做模糊匹配。

两个参数缺一不可：

- 只有 `--rsyncable` 没有 `--fuzzy`：rsync 找不到基准，整份传。
- 只有 `--fuzzy` 没有 `--rsyncable`：rsync 找到了基准，但 gzip 流的差异太大，用不上。

两个一起用，差异变得又小又可用。

## 实测

同一台腾讯中继，同样 2.5 Mbps 上限，同样的 6.71 MB `ouro-app-0.1.X.tar.gz`：

</div>

<div class="lang-zh">

吞吐量一样，因为管道还是 2.5 Mbps。赢在 rsync 只需要推 15% 的文件。同样的带宽下，上传时间降到了原来的 **六分之一**。

这 15% 才是有意思的地方。这两个版本之间**一行代码都没改**——源码树里唯一的差异就是 `package.json` 里的版本号字符串（`0.1.1` → `0.1.2`）。其他都是逐字节一致的。那为什么还是有整整 1 MB 的差异？

原因有三：

1. Bun 的打包器会把版本字符串嵌进 `server.js`。
2. `tar` 默认保留文件的 mtime，每次构建的 mtime 都不一样。
3. `gzip --rsyncable` 对相同输入产生的输出仍然会因为内部刷新点对齐差异而略有不同。

生产里有真实增量改动时，差异大致还是落在 10–20% 这个区间。2.5 Mbps 下，这是 20 秒和 3 秒的差别。

## 真正要做的三件事

要端到端跑通，需要：

### 1. 压缩时加 `--rsyncable`

把 `tar` 管道接到支持 rsync 的压缩器上。`gzip`、`pigz`、`zstd` 三个都支持 `--rsyncable`：

</div>

<div class="lang-zh">

如果你在用苹果自带的 `/usr/bin/gzip` 或者 BusyBox 的 gzip，是没有这个参数的。macOS 装 GNU 版的 gzip：

</div>

<div class="lang-zh">

### 2. 上传时加 `rsync --fuzzy --fuzzy --inplace --partial`

`--inplace` 是必须的——让增量直接落到目标文件里，而不是写临时文件（会抵消增量写入的好处）。`--partial` 保留传了一半的文件，断线后可以续传：

</div>

<div class="lang-zh">

macOS 自带的是 `openrsync`，BSD 的重写版，号称兼容 rsync 2.6.9，但少了 `--fuzzy`。装 GNU rsync：

</div>

<div class="lang-zh">

### 3. 旧版本在**上传之后**再清理，不要在之前清

如果流水线先删旧 tarball 再传新的，rsync 就没有基准可以对比，白白付全额的代价。上传成功之后再清掉旧版本，至少把上一版保留到新版本传完。

## Bun 里的实现

我们的 `publish.ts` 用的是 Bun 的 shell 模板。`scp` 换 `rsync` 大概长这样：

</div>

<div class="lang-zh">

解析 `--stats` 的输出，每次发布都能打印出真实的测量值：

</div>

<div class="lang-zh">

## 什么情况下用不上

- **这条发布线的第一次发布。** 没有旧版本可以做基准——第一次全额付费，之后才便宜。
- **Docker 镜像 tarball。** `docker save` 产出的分层是确定的，但外层 tar 把它们交错打包，镜像里的小改动也可能导致 tarball 差异很大。这种情况直接用 Docker registry——`docker push` 本身就是按层的摘要做增量传输的。
- **管道本来就快。** 100 Mbps 下 20 秒 → 3 秒变成 0.2 秒 → 0.03 秒，没人在乎。这招只在带宽是瓶颈的时候才有意义。

## 小结

最快的字节，是你不传的那一个。与其花钱升带宽，或者上更复杂的同步工具（mutagen、syncthing、casync），不如先试试：

1. 构建时给 gzip 加 `--rsyncable`。
2. 上传时用 `rsync --fuzzy --fuzzy --inplace --partial`。
3. 清理旧版本放在上传之后。

三个参数，不加新服务，不加新依赖，不升 VPS。同样的带宽，发布快六倍。

</div>
