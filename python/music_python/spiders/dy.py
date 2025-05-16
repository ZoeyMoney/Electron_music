import requests
from flask import Blueprint, jsonify
from settings import GET_HEADERS,post_headers, LINKS
from lxml import etree

music1_bp = Blueprint('music1', __name__)

# 抖音歌单
@music1_bp.route('/api/music1', methods=['GET'])
def music1_handler():
    page = 1
    all_music_data = []  # 存储所有页面的音乐数据

    while page <= 2:
        res = requests.get(f"{LINKS['dyUrl']}/douyin/{page}.html", headers=GET_HEADERS)
        page_content = etree.HTML(res.text)

        # 获取音乐列表
        music_list = page_content.xpath('//*[@class="play_list"]/ul/li')
        music_data = []
        for music in music_list:
            music_name = music.xpath('.//*[@class="name"]/a/text()')
            music_href = music.xpath('.//*[@class="name"]/a/@href')
            if music_name:
                # 清理多余空白字符
                music_name = music_name[0].strip()
                music_href = music_href[0].strip()

                # 过滤 链接http://www.4c44.com/mp3/hnknkdcnnm.html 只要 hnknkdcnnm
                filename = music_href.split('/').pop().replace('.html', '');
                p_headers = post_headers(filename)
                play_res = requests.post(LINKS['play_url'],data = {"id":filename,"type":"music"},headers=p_headers)
                mp3_url = play_res.json().get('url')
                lrc = play_res.json().get('lrc')
                pic = play_res.json().get('pic')
                title = play_res.json().get('title')
            # 将每一条音乐数据添加到当前页面的 music_data 中
            music_data.append({
                'name': music_name,
                'lrc' : lrc,
                'pic' : pic,
                'mp3_url' : mp3_url
            })

        # 把每一页的数据添加到 all_music_data 中
        all_music_data.extend(music_data)

        page += 1  # 增加页码

    # 返回所有页面的音乐数据
    return jsonify({
        'data': {
            'title': title[0] if title else '未找到标题',
            'music': all_music_data,  # 返回所有页面的音乐数据
            'total': len(all_music_data)  # 返回音乐数据总数
        }
    })
