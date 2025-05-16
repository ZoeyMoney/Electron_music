import requests
import random

from settings import TIMEOUT, post_headers, LINKS
from lxml import etree
from flask import request

def fetch_music_detail(music):
    try:
        music_name = music.xpath('.//*[@class="name"]/a/text()')
        music_href = music.xpath('.//*[@class="name"]/a/@href')

        # print(f"抓取到的音乐名称: {music_name}, 音乐链接: {music_href}")

        if music_name and music_href:
            filename = music_href[0].split('/').pop().replace('.html', '')
            p_headers = post_headers(filename)  # 确保 post_headers 返回的是字典
            play_res = requests.post(LINKS['play_url'], data={"id": filename, "type": "music"}, headers=p_headers, timeout=TIMEOUT)

            print(f"play_res 内容: {play_res.text}")  # 打印响应内容查看

            # 确保 play_res.json() 返回的是字典
            play_data = play_res.json()
            if not isinstance(play_data, dict):
                # print(f"play_res 返回的数据不是字典，返回值: {play_data}")
                return None

            mp3_url = play_data.get('url')
            lrc = play_data.get('lrc')
            pic = play_data.get('pic')

            # 返回一个标准化的字典
            return {
                'name': music_name[0].strip() if music_name else '未知',
                'lrc': lrc or '无歌词',
                'pic': pic or '无图片',
                'mp3_url': mp3_url or '无音频链接'
            }
        else:
            print("没有找到有效的音乐数据")
            return None
    except Exception as e:
        print(f"处理音乐数据时出错: {e}")
        return None

# 判断是否有下一页
def has_next_page(html_text):
    tree = etree.HTML(html_text)

    # 找出当前页 <a class="current">
    current = tree.xpath('//div[@class="page"]/a[@class="current"]')
    if not current:
        return False

    # 获取它后面是否还有兄弟 <a>
    next_links = current[0].itersiblings(tag='a')
    return any(True for _ in next_links)

# 返回音乐地址
def data_mp3_page(href):
    print(href,'hrefsdasd')
    filename = href.split('/').pop().replace('.html', '')
    p_headers = post_headers(filename)  # 确保 post_headers 返回的是字典
    play_res = requests.post(LINKS['play_url'], data={"id": filename, "type": "music"}, headers=p_headers,timeout=TIMEOUT)
    # print(f"play_res 内容: {play_res.text}")  # 打印响应内容查看
    # 确保 play_res.json() 返回的是字典
    play_data = play_res.json()
    if not isinstance(play_data, dict):
        # print(f"play_res 返回的数据不是字典，返回值: {play_data}")
        return None

    mp3_url = play_data.get('url')
    lrc = play_data.get('lrc')
    pic = play_data.get('pic')

    # 返回一个标准化的字典
    return {
        'lrc': lrc or '无歌词',
        'pic': pic or '无图片',
        'mp3_url': mp3_url or '无音频链接'
    }