import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time

BASE_URL = "https://www.cduestc.cn"
LIST_URL = "https://www.cduestc.cn/newsinternet/init_1030100/list2xue2xiao4xin1wen21030108"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36"
}


def get_news_list():
    res = requests.get(LIST_URL, headers=headers)
    res.encoding = res.apparent_encoding
    soup = BeautifulSoup(res.text, "html.parser")

    # 找出所有新闻链接（根据网站结构可能需要调整）
    links = soup.find_all("a", href=True)
    news_links = []

    for link in links:
        href = link['href']
        full_url = urljoin(BASE_URL, href)
        title = link.get_text(strip=True)
        if "/newsinternet/" in href and title:
            news_links.append((title, full_url))

    return news_links


def parse_news_detail(url):
    res = requests.get(url, headers=headers)
    res.encoding = res.apparent_encoding
    soup = BeautifulSoup(res.text, "html.parser")

    # 提取文字
    paragraphs = soup.find_all("p")
    text = "\n".join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])

    # 提取图片
    images = [urljoin(url, img['src']) for img in soup.find_all("img", src=True)]

    # 提取视频（video 或 iframe）
    videos = []
    for tag in soup.find_all(["video", "iframe"]):
        src = tag.get("src")
        if src:
            videos.append(urljoin(url, src))

    return {
        "url": url,
        "text": text,
        "images": images,
        "videos": videos
    }


def main():
    news_list = get_news_list()
    print(f"共发现 {len(news_list)} 篇新闻。开始爬取详情...")

    for i, (title, url) in enumerate(news_list):
        print(f"\n[{i + 1}] 正在爬取：{title} -> {url}")
        data = parse_news_detail(url)
        print("文字内容（前100字）：", data["text"][:100])
        print("图片数量：", len(data["images"]))
        print("视频数量：", len(data["videos"]))
        time.sleep(1)  # 避免请求过快被封


if __name__ == "__main__":
    main()
