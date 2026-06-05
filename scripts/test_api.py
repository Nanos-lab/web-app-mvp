import urllib.request
import json

# 测试详情 API 返回的图片数据
url = "http://localhost:8000/api/v1/destinations/salar-de-uyuni"
resp = urllib.request.urlopen(url)
data = json.loads(resp.read())

dest = data["data"]
print("=== 目的地详情 API 返回的图片数据 ===")
print(f"cover_image_url: {dest['media']['cover_image_url']}")
print(f"thumbnail_url: {dest['media']['thumbnail_url']}")
print(f"images count: {len(dest['media']['images'])}")
for img in dest['media']['images']:
    print(f"  - {img['url']} ({img.get('width')}x{img.get('height')})")
