from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
import os

def handler(event, context):
    # Vercel 传递的 body 需要解析
    try:
        body = json.loads(event.get('body', '{}'))
        prompt = body.get('prompt')
        ratio = body.get('ratio', '1:1')
        
        API_KEY = os.environ.get('VITE_DOUBAO_API_KEY')
        IMAGE_ENDPOINT_ID = os.environ.get('VITE_DOUBAO_IMAGE_ENDPOINT_ID')
        ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

        if not IMAGE_ENDPOINT_ID:
            return {
                'statusCode': 500,
                'body': json.dumps({'success': False, 'message': '未配置 IMAGE_ENDPOINT_ID'})
            }

        size = '2048x2048' if ratio == '1:1' else '2560x1440'

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
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({"success": True, "url": image_url})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'success': False, 'message': str(e)})
        }
