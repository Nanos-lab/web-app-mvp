"""
download_images.py — 从 Unsplash 下载目的地图片用于 MVP 种子数据。

用法: python scripts/download_images.py
"""

import sys
import urllib.request
import urllib.error
import time
from pathlib import Path

# Windows 终端 GBK 编码兼容
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "images" / "destinations"

# ─── 图片映射: (目标文件夹, 文件名, Unsplash Photo ID) ──────────────────────────
# Unsplash Photo ID 来自 unsplash.com/photos/{PHOTO_ID}
PHOTOS: list[tuple[str, str, str]] = [
    # ═══ Salar de Uyuni — 玻利维亚天空之镜 ═══
    ("salar-de-uyuni", "cover.jpg", "J2RixqJ33R4"),           # 人在镜面盐沼中行走
    ("salar-de-uyuni", "thumb.jpg", "J2RixqJ33R4"),
    ("salar-de-uyuni", "01-mirror.jpg", "J2RixqJ33R4"),       # 雨季镜面倒影
    ("salar-de-uyuni", "01-mirror-thumb.jpg", "J2RixqJ33R4"),
    ("salar-de-uyuni", "02-stars.jpg", "MsXD0hXcX2s"),        # 星空下的盐沼
    ("salar-de-uyuni", "02-stars-thumb.jpg", "MsXD0hXcX2s"),
    ("salar-de-uyuni", "03-island.jpg", "wRW-tQMer_g"),       # 远处山脉/仙人掌岛远景
    ("salar-de-uyuni", "03-island-thumb.jpg", "wRW-tQMer_g"),

    # ═══ Waitomo — 新西兰萤火虫星河 ═══
    ("waitomo", "cover.jpg", "m3Hu9bUaAfc"),                  # 蓝色萤光（洞穴萤火虫效果）
    ("waitomo", "thumb.jpg", "m3Hu9bUaAfc"),
    ("waitomo", "01-glowworms.jpg", "m3Hu9bUaAfc"),           # 洞穴萤火虫蓝光
    ("waitomo", "01-glowworms-thumb.jpg", "m3Hu9bUaAfc"),
    ("waitomo", "02-boat.jpg", "-yCd-Lx37KQ"),                # 洞穴内景/暗河
    ("waitomo", "02-boat-thumb.jpg", "-yCd-Lx37KQ"),

    # ═══ Golden Bridge — 越南巨大之手 ═══
    ("golden-bridge", "cover.jpg", "CsoQ-jm_0vQ"),            # 金桥被巨手托举全景
    ("golden-bridge", "thumb.jpg", "CsoQ-jm_0vQ"),
    ("golden-bridge", "01-hands.jpg", "CsoQ-jm_0vQ"),         # 巨手+金桥特写
    ("golden-bridge", "01-hands-thumb.jpg", "CsoQ-jm_0vQ"),
    ("golden-bridge", "02-clouds.jpg", "pXiXeosLOAk"),        # 另一角度/云雾版本
    ("golden-bridge", "02-clouds-thumb.jpg", "pXiXeosLOAk"),
]


def download_photo(photo_id: str, dest_path: Path) -> int | None:
    """
    从 Unsplash 下载图片并保存到目标路径。
    返回文件大小（字节），失败返回 None。
    """
    download_url = f"https://unsplash.com/photos/{photo_id}/download?force=true"

    req = urllib.request.Request(
        download_url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; MVP-ImageDownloader/1.0)",
            "Accept": "image/avif,image/webp,image/*,*/*",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            data = response.read()
            dest_path.write_bytes(data)
            return len(data)
    except urllib.error.HTTPError as e:
        print(f"    HTTP {e.code}: {photo_id} -> {dest_path.name}")
        return None
    except urllib.error.URLError as e:
        print(f"    URL Error: {e.reason}")
        return None
    except Exception as e:
        print(f"    Exception: {e}")
        return None


def main() -> None:
    print("=" * 60)
    print("  下载目的地图片 — Unsplash → 本地 images/")
    print("=" * 60)

    total = 0
    success = 0
    skipped = 0
    failed = 0

    for folder, filename, photo_id in PHOTOS:
        dest_dir = IMAGES_DIR / folder
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / filename
        total += 1

        if dest_path.exists() and dest_path.stat().st_size > 0:
            print(f"  SKIP  {folder}/{filename}  (already exists)")
            skipped += 1
            continue

        print(f"  DOWN  {folder}/{filename}  <-  unsplash.com/photos/{photo_id}")
        size = download_photo(photo_id, dest_path)

        if size:
            print(f"    OK   {size:>10,} bytes")
            success += 1
        else:
            print(f"    FAIL  download failed")
            failed += 1

        # 避免对 Unsplash 造成压力
        time.sleep(0.8)

    print("-" * 60)
    print(f"  总计: {total}  |  成功: {success}  |  跳过: {skipped}  |  失败: {failed}")
    print("=" * 60)


if __name__ == "__main__":
    main()
