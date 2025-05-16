# webapi/app.py
from flask import Flask
from spiders.dy import music1_bp
from spiders.search import search
from spiders.PlayList import playList
from spiders.playUrl import playUrl

def create_app():
    app = Flask(__name__)

    # 注册所有蓝图
    app.register_blueprint(music1_bp)   #抖音热歌榜
    app.register_blueprint(search) # 搜索歌曲
    app.register_blueprint(playList) # 歌单
    app.register_blueprint(playUrl) # 获取音乐信息

    return app
