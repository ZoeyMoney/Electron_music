import requests
from flask import Blueprint, request, jsonify
from lxml import etree
from settings import LINKS, TIMEOUT, GET_HEADERS
import time
import json

from utils.utils import has_next_page

playList = Blueprint('playList', __name__)

# 歌单接口
@playList.route('/api/playList', methods=['GET'])
def playlist_handler():
    page = int(request.args.get('page', 1)) #默认为第一页
    data_index = int(request.args.get('data_index', 10)) #默认获取10个

    playlist_all_data = []

    playlist_url = f"{LINKS['url']}/playlists/index/{page}.html"
    try:
        #每次请求间隔1秒
        time.sleep(1)
        res = requests.get(playlist_url,timeout=TIMEOUT,headers=GET_HEADERS)
        # 显示设置编码为utf-8
        res.encoding = 'utf-8'
        page_content = etree.HTML(res.text)
        playlist_data = page_content.xpath('//*[@class="video_list"]/ul/li')[:data_index]
        print(playlist_data)
        for play in playlist_data:
            pic = play.xpath('.//*[@class="pic"]/a/img/@src')
            name = play.xpath('.//*[@class="name"]/a/text()')
            href = play.xpath('.//*[@class="name"]/a/@href')
            url_href = LINKS['url'] + href[0] if href else ''
            playlist_all_data.append({
                'pic': pic[0] if pic else '',
                'name': name[0] if name else '',
                'url_href': url_href
            })
    except Exception as e:
        return jsonify({
            'error': f"Failed to fetch page {page}: {str(e)}",
            'data': 123
        }), 500
    return jsonify({
        'data':playlist_all_data,
    })

# 爬取每首歌
@playList.route('/api/playListDetail', methods=['GET'])
def playlistUrl_handler():
    # 获取页数
    page = int(request.args.get('page',1)) #默认第一页
    # 默认几条数据
    data_index = request.args.get('data_index') #默认显示10条
    # 获取url
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "Query parameter is required"}), 400
    url_all_data = [] #所有数据列表
    music_data = [] # 数据存放
    try:
        time.sleep(1)
        res = requests.get(url,timeout=TIMEOUT,headers=GET_HEADERS)
        #显示编码utf-8
        res.encoding = 'utf-8'
        page_content = etree.HTML(res.text)
        music_list = page_content.xpath('//*[@class="play_list"]/ul/li')
        for index in music_list:
            music_name = index.xpath('.//*[@class="name"]/a/text()')
            music_href = index.xpath('.//*[@class="name"]/a/@href')
            # 提取名字，如果 name 是一个非空列表
            if music_name:
                parts = music_name[0].split(' - ')
                music_title = parts[0].strip()
                artist = parts[1].strip() if len(parts) > 1 else '未知歌手'
            else:
                music_title = ''
                artist = '未知歌手'
            url_all_data.append({
                'music_title': music_title,
                'artist': artist,
                'href': music_href[0] if music_href else ''
            })
        # url_all_data.extend(music_data)
        # ➤ 若 data_index 参数合法，进行切片
        if data_index is not None:
            try:
                data_index = int(data_index)
                if data_index > 0:
                    url_all_data = url_all_data[:data_index]
            except ValueError:
                pass  # 如果不是合法整数，忽略切片操作
        #使用 has_next_page 判断是否还有下一页
        has_next = has_next_page(res.text)
    except Exception as e:
        return jsonify({
            'error': f"Failed to fetch page {page}: {str(e)}",
            'data': url_all_data
        }), 500
    return jsonify({
        'data':{
            'music_list': url_all_data,
            'current_page': page,
            'has_next': has_next
        }
    })

