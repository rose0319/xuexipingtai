import requests
import time
import pymysql

#数据库
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'computerdatabases',
    'charset': 'utf8mb4'
}

#保存到数据库
def save_to_mysql(bvid, title, url, author, keyword):
    try:
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor()
        sql = '''
            INSERT INTO bilibili (bvid, title, url, author, keyword)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE title=VALUES(title), url=VALUES(url), author=VALUES(author)
        '''
        cursor.execute(sql, (bvid, title, url, author, keyword))
        conn.commit()
    except Exception as e:
        print(f'[数据库写入失败] {e}')
    finally:
        cursor.close()
        conn.close()

def search_bilibili_videos(keyword, max_pages=3):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Origin': 'https://www.bilibili.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cookie': '''buvid3=955D414C-6F76-938C-C266-9FD8735E4DF703534infoc; b_nut=1742463003; _uuid=22911585-64AE-E941-D2AC-6D10715DF9F10908865infoc; enable_web_push=DISABLE; enable_feed_channel=ENABLE; buvid4=F83D99A5-F69B-8D8F-88B6-ED66E7906FF257646-023030215-nyTXSN3OedbMES76wEJ6Rg%3D%3D; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDI3MjIyMDQsImlhdCI6MTc0MjQ2Mjk0NCwicGx0IjotMX0.o-KWXT3w1oODEN_lNICP8hoJ7slN1-dXWuBO5Z86MFQ; bili_ticket_expires=1742722144; buvid_fp=baf9e52ddadd91370fbb725aca0f4c71; SESSDATA=f25512d0%2C1758015014%2C9c051%2A31CjCmborFF4utNGGp6uqZy0WDsvBbB6JwMpZL2g730MSMyF1DuHElmqxKuG2nixbZVJ8SVjM2NXJhNWI0VGUwSFBDbTJqc29UQ1BuUmtQV2lyMTdqY0x4elA4VVVyaGwtVWRGYVZLQUNHUVY1YWl6bEwxYlJuRnUtWW5aQzhFa3FXbTk1ZWI1OXZBIIEC; bili_jct=d113b70d60e671e88e52b8437bcd98ef; DedeUserID=527458208; DedeUserID__ckMd5=92fc0466be7df6e3; rpdid=|(u)l~Y)JkYm0J'u~RkRYJu|Y; header_theme_version=CLOSE; CURRENT_FNVAL=4048; b_lsid=E510A5CF9_195C12DF34D; bsource=search_baidu; bmg_af_switch=1; bmg_src_def_domain=i1.hdslb.com; home_feed_column=4; browser_resolution=835-954'''
    }

    for page in range(1, max_pages + 1):
        url = f'https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={keyword}&page={page}'

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code != 200:
                print(f'第 {page} 页请求失败，状态码: {resp.status_code}')
                continue

            data = resp.json()
            results = data.get('data', {}).get('result', [])
            if not results:
                print(f'第 {page} 页无结果')
                break

            for video in results:
                title = video.get('title', '').replace('<em class="keyword">', '').replace('</em>', '')
                bvid = video.get('bvid', '')
                author = video.get('author', '')
                video_url = f'https://www.bilibili.com/video/{bvid}' if bvid else video.get('arcurl')

                print(f'title: {title}')
                print(f'BV: {bvid}')
                print(f'url: {video_url}')
                print(f'UP: {author}')
                print('------------------------------------------------')

                save_to_mysql(bvid, title, video_url, author, keyword)


            time.sleep(1)

        except Exception as e:
            print(f'请求出错：{e}')

search_bilibili_videos(keyword='javascript', max_pages=10)

