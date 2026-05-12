from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
import os
import time

def handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        prompt = body.get('prompt')
        duration = int(str(body.get('duration', '4')).replace('s', ''))
        
        API_KEY = os.environ.get('VITE_DOUBAO_API_KEY')
        VIDEO_ENDPOINT_ID = os.environ.get('VITE_DOUBAO_VIDEO_ENDPOINT_ID')
        ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

        if not VIDEO_ENDPOINT_ID:
            return {
                'statusCode': 500,
                'body': json.dumps({'success': False, 'message': '未配置 VIDEO_ENDPOINT_ID'})
            }

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
        
        # 轮询逻辑 (注意：Vercel 函数有执行时长限制，通常 10s-60s)
        video_url = None
        for _ in range(15):
            time.sleep(2)
            status_req = urllib.request.Request(
                f"{ARK_BASE_URL}/video/tasks/{task_id}",
                headers={'Authorization': f'Bearer {API_KEY}'},
                method='GET'
            )
            try:
                with urllib.request.urlopen(status_req) as resp:
                    status_data = json.loads(resp.read().decode('utf-8'))
                    if status_data.get('status') == 'succeeded':
                        video_url = status_data['video_url']
                        break
                    elif status_data.get('status') == 'failed':
                        raise Exception(status_data.get('error_message'))
            except:
                continue

        if video_url:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({"success": True, "url": video_url})
            }
        else:
            return {
                'statusCode': 408,
                'body': json.dumps({"success": False, "message": "生成超时"})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'success': False, 'message': str(e)})
        }
