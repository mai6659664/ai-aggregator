import urllib.request
import urllib.parse
import json
import time
import base64

def handler(event, context):
    try:
        query = event.get('queryStringParameters', {})
        target_url = query.get('url')
        
        if not target_url:
            return {
                'statusCode': 400,
                'body': json.dumps({'success': False, 'message': 'Missing url parameter'})
            }

        req = urllib.request.Request(target_url)
        with urllib.request.urlopen(req) as response:
            content = response.read()
            content_type = response.info().get_content_type()
            
            ext = ".jpg" if "image" in content_type else ".mp4"
            filename = f"ai-result-{int(time.time())}{ext}"

            # 使用 base64 编码返回二进制文件，这是 Vercel 处理文件的标准做法
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': content_type,
                    'Content-Disposition': f'attachment; filename="{filename}"',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': base64.b64encode(content).decode('utf-8'),
                'isBase64Encoded': True
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'success': False, 'message': str(e)})
        }
