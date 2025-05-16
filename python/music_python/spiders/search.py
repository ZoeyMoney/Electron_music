import re

import requests
from flask import Blueprint, request, jsonify
from lxml import etree

from settings import LINKS, post_headers, TIMEOUT, GET_HEADERS
from utils.utils import fetch_music_detail, has_next_page
import time
import json

search = Blueprint('search', __name__)

# 搜索接口
@search.route('/api/search', methods=['GET'])
def search_handler():
    query = request.args.get('query', '').strip()  #搜索内容
    page = int(request.args.get('page', 1))  # 默认为第 1 页
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    search_all_music_data = []

    search_url = f"{LINKS['url']}/so/{query}/{page}.html"
    try:
        #每次请求间隔1秒
        time.sleep(1)
        res = requests.get(search_url,timeout=TIMEOUT,headers=GET_HEADERS)
        # 显式设置编码为 utf-8
        res.encoding = 'utf-8'
        page_content = etree.HTML(res.text)
        music_list = page_content.xpath('//*[@class="play_list"]/ul/li')[:35]
        # 判断是否还有下一页
        has_next = has_next_page(res.text)
        for listMusic in music_list:
            name = listMusic.xpath('.//*[@class="name"]/a/text()')
            href = listMusic.xpath('.//*[@class="name"]/a/@href')
            href = LINKS['url'] + href[0] if href else ''

            # 安全检查
            raw_text = name[0].strip() if name else ''

            # 去除奇怪的空格字符（如 \xa0 等）
            raw_text = re.sub(r'\s+', ' ', raw_text).replace('\xa0', ' ').strip()

            # 分割逻辑增强
            if ' - ' in raw_text:
                title, artist = raw_text.rsplit(' - ', 1)
            elif '-' in raw_text:
                title, artist = raw_text.rsplit('-', 1)
            else:
                title, artist = raw_text, '未知歌手'

            search_all_music_data.append({
                'music_title': title.strip(),
                'href': href,
                'artist': artist.strip()
            })
    except Exception as e:
        return jsonify({
            'error': f"Failed to fetch page {page}: {str(e)}",
            'data': search_all_music_data
        }), 500
    return jsonify({
        'data': search_all_music_data,
        'has_next': has_next
    })