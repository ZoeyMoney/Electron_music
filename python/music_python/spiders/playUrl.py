import json

import requests
from flask import Blueprint, request, jsonify

from utils.utils import data_mp3_page

playUrl = Blueprint('playUrl', __name__)

# 获取音乐链接
@playUrl.route('/api/playUrl', methods=['GET'])
def playUrl_handler():
    # 获取链接
    query_href = request.args.get('href')
    res = data_mp3_page(query_href)
    return jsonify(res)
