import urllib.request
import urllib.parse
import json
import time

def handler(event, context):
    try:
        # Vercel 的 query 参数在 event['queryStringParameters'] 中
        query = event.get('queryStringParameters', {})
        target_url = query.get('url')
        
        if not target_url:
            return {
                'statusCode': 400,
                'body': json.dumps({'success': False, 'message': '缺少 url 参数'})
            }

        req = urllib.request.Request(target_url)
        with urllib.request.urlopen(req) as response:
            content = response.read()
            content_type = response.info().get_content_type()
            
            ext = ".jpg" if "image" in content_type else ".mp4"
            filename = f"ai-result-{int(time.time())}{ext}"

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': content_type,
                    'Content-Disposition': f'attachment; filename="{filename}"',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': content.decode('latin1'), # Vercel 处理二进制需要特殊处理或 base64
                'isBase64Encoded': False
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'success': False, 'message': str(e)})
        }
