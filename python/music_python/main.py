# main.py
from settings import PROXY
from webapi.app import create_app
from flask_cors import CORS

app = create_app()

# 启用CORS
CORS(app)

if __name__ == '__main__':
    print(f"启动服务：http://localhost:{PROXY}")
    app.run(debug=True, port=PROXY)
