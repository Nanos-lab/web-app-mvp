import urllib.request

url = "http://localhost:8000/images/destinations/salar-de-uyuni/01-mirror.jpg"
try:
    resp = urllib.request.urlopen(url)
    ct = resp.headers.get("Content-Type")
    cl = resp.headers.get("Content-Length")
    print(f"Status: {resp.status}")
    print(f"Content-Type: {ct}")
    print(f"Length: {cl} bytes")
    print(f"OK - 图片服务正常")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} {e.reason}")
except Exception as e:
    print(f"Error: {e}")
