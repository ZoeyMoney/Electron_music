# 枚举链接
LINKS = {
    'dyUrl' : 'http://www.4c44.com/list', #抖音热歌榜
    'url' : 'http://www.4c44.com', # 爬取地址
    'play_url': 'http://www.4c44.com/js/play.php' # post接口 id: xxx.hnkhkdmcck.html type: music
}


# get请求头
GET_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'referer': 'http://www.4c44.com',  # 添加 referer 头  防止反爬
    'accept': 'application/json',
    'content-type': 'application/json',
    'Cookie': 'Hm_tf_psylaqd8hs5=1746695948; Hm_lvt_acf29e6dc50fa3e2509fb9a7e5687a19=1746695948,1746698589,1746748476; HMACCOUNT=61E2DD7771DD6C79; Hm_lvt_psylaqd8hs5=1746695948,1746698589,1746748477; Hm_lpvt_psylaqd8hs5=1746748479; Hm_lpvt_acf29e6dc50fa3e2509fb9a7e5687a19=1746748479'
}

# post请求头
def post_headers(value):
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'referer': f'http://www.4c44.com/mp3/{value}',  # 添加 referer 头  防止反爬
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    }


# 请求超时时间（秒）
TIMEOUT = 60

# 是否启用代理
USE_PROXY = False

# 代理池（若启用）
PROXIES = [
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8888",
]

# 重试次数
RETRY_TIMES = 3

# 默认编码
DEFAULT_ENCODING = 'utf-8'

#端口
PROXY = 9000
