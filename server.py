import http.server
import socketserver
import json
import urllib.request
import urllib.error
import os
import time

# 配置
PORT = 3000
ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

def get_env_variable(name):
    """从 .env 文件读取变量"""
    try:
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith(name):
                    return line.split('=')[1].strip()
    except Exception:
        pass
    return os.environ.get(name)

API_KEY = get_env_variable('VITE_DOUBAO_API_KEY')
IMAGE_ENDPOINT_ID = get_env_variable('VITE_DOUBAO_IMAGE_ENDPOINT_ID')
VIDEO_ENDPOINT_ID = get_env_variable('VITE_DOUBAO_VIDEO_ENDPOINT_ID')

class APIProxyHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/proxy-download'):
            self.handle_proxy_download()
        else:
            self.send_error(404, "Not Found")

    def handle_proxy_download(self):
        """代理下载资源以绕过 CORS 限制"""
        try:
            query = self.path.split('?', 1)[1]
            params = urllib.parse.parse_qs(query)
            target_url = params.get('url', [None])[0]
            
            if not target_url:
                raise Exception("缺少 url 参数")

            print(f"📥 正在通过代理下载: {target_url[:50]}...")
            
            req = urllib.request.Request(target_url)
            with urllib.request.urlopen(req) as response:
                content = response.read()
                content_type = response.info().get_content_type()
                
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                # 强制触发浏览器下载
                filename = f"ai-result-{int(time.time())}"
                ext = ".jpg" if "image" in content_type else ".mp4"
                self.send_header('Content-Disposition', f'attachment; filename="{filename}{ext}"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)
                print("✅ 下载代理成功")

        except Exception as e:
            print(f"❌ 下载代理失败: {str(e)}")
            self.send_error_response(str(e))

    def do_POST(self):
        if self.path == '/api/generate-image':
            self.handle_generate_image()
        elif self.path == '/api/generate-video':
            self.handle_generate_video()
        else:
            self.send_error(404, "Not Found")

    def handle_generate_image(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = json.loads(post_data.decode('utf-8'))
            
            prompt = params.get('prompt')
            ratio = params.get('ratio', '1:1')
            
            # 豆包 4.0/4.5 要求至少 3.6M 像素 (2K 分辨率)
            if ratio == '1:1':
                size = '2048x2048'
            else:
                size = '2560x1440' # 16:9 的 2K 分辨率

            if not IMAGE_ENDPOINT_ID:
                raise Exception("未在 .env 中配置 VITE_DOUBAO_IMAGE_ENDPOINT_ID")

            print(f"🚀 发起图片请求 | 模型: {IMAGE_ENDPOINT_ID} | 提示词: {prompt[:20]}...")

            payload = {
                "model": IMAGE_ENDPOINT_ID,
                "prompt": prompt,
                "size": size,
                "n": 1
            }

            req = urllib.request.Request(
                f"{ARK_BASE_URL}/images/generations",
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {API_KEY}',
                    'Content-Type': 'application/json'
                },
                method='POST'
            )

            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                image_url = result['data'][0]['url']
                print("✅ 图片生成成功!")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "url": image_url}).encode('utf-8'))

        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"❌ 豆包 API 报错 (HTTP {e.code}): {error_body}")
            self.send_error_response(f"API 错误: {error_body}")
        except Exception as e:
            print(f"❌ 系统出错: {str(e)}")
            self.send_error_response(str(e))

    def handle_generate_video(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = json.loads(post_data.decode('utf-8'))
            
            prompt = params.get('prompt')
            duration = int(params.get('duration', '4').replace('s', ''))

            if not VIDEO_ENDPOINT_ID:
                raise Exception("未在 .env 中配置 VITE_DOUBAO_VIDEO_ENDPOINT_ID")

            print(f"🎬 提交视频任务 | 模型: {VIDEO_ENDPOINT_ID} | 提示词: {prompt[:20]}...")

            payload = {
                "model": VIDEO_ENDPOINT_ID,
                "prompt": prompt,
                "duration": duration
            }

            req = urllib.request.Request(
                f"{ARK_BASE_URL}/video/tasks",
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {API_KEY}',
                    'Content-Type': 'application/json'
                },
                method='POST'
            )

            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                task_id = result['id']
            
            print(f"⏳ 任务已提交, ID: {task_id}, 正在轮询结果...")

            video_url = None
            for i in range(30): # 最多等待 60 秒
                time.sleep(2)
                status_req = urllib.request.Request(
                    f"{ARK_BASE_URL}/video/tasks/{task_id}",
                    headers={'Authorization': f'Bearer {API_KEY}'},
                    method='GET'
                )
                try:
                    with urllib.request.urlopen(status_req) as resp:
                        status_data = json.loads(resp.read().decode('utf-8'))
                        status = status_data.get('status')
                        if status == 'succeeded':
                            video_url = status_data['video_url']
                            print("✅ 视频生成成功!")
                            break
                        elif status == 'failed':
                            raise Exception(f"生成失败: {status_data.get('error_message')}")
                        else:
                            print(f"   [轮询] 状态: {status}...")
                except:
                    continue

            if video_url:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "url": video_url}).encode('utf-8'))
            else:
                raise Exception("视频生成超时，请稍后在控制台查看")

        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"❌ 豆包 API 报错 (HTTP {e.code}): {error_body}")
            self.send_error_response(f"API 错误: {error_body}")
        except Exception as e:
            print(f"❌ 系统出错: {str(e)}")
            self.send_error_response(str(e))

    def send_error_response(self, message):
        self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"success": False, "message": message}).encode('utf-8'))

print(f"🚀 Python 后端服务已启动: http://localhost:{PORT}")
print(f"🔑 API Key: {'已加载' if API_KEY else '❌ 未找到'}")
print(f"🖼 图片接入点: {IMAGE_ENDPOINT_ID or '❌ 未配置'}")
print(f"🎥 视频接入点: {VIDEO_ENDPOINT_ID or '❌ 未配置'}")

with socketserver.TCPServer(("", PORT), APIProxyHandler) as httpd:
    httpd.allow_reuse_address = True
    httpd.serve_forever()
