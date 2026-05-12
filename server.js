import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

const API_KEY = process.env.VITE_DOUBAO_API_KEY;
const ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';

// 1. AI 绘画接口
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt, ratio, model } = req.body;

        // 映射比例到豆包支持的尺寸
        const size = ratio === '1:1' ? '1024x1024' : '1024x576';

        console.log('正在请求豆包图片生成 API...');
        
        const response = await axios.post(
            `${ARK_BASE_URL}/images/generations`,
            {
                model: 'stable-diffusion-xl', // 示例模型名，请根据实际接入点修改
                prompt: prompt,
                size: size,
                n: 1
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 返回图片 URL
        const imageUrl = response.data.data[0].url;
        res.json({ success: true, url: imageUrl });

    } catch (error) {
        console.error('图片生成失败:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: error.response?.data?.error?.message || '后端服务异常' 
        });
    }
});

// 2. AI 视频生成接口 (异步任务模式)
app.post('/api/generate-video', async (req, res) => {
    try {
        const { prompt, duration } = req.body;

        console.log('正在提交豆包视频生成任务...');

        // 提交任务
        const submitResponse = await axios.post(
            `${ARK_BASE_URL}/video/tasks`,
            {
                model: 'cv-video-generation', // 示例模型名
                prompt: prompt,
                duration: parseInt(duration) // 2, 4, 6
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const taskId = submitResponse.data.id;
        console.log('任务提交成功, ID:', taskId);

        // 简易轮询：每隔 2 秒检查一次状态，最多检查 15 次 (30秒)
        let attempts = 0;
        const maxAttempts = 15;
        
        const checkStatus = async () => {
            const statusResponse = await axios.get(
                `${ARK_BASE_URL}/video/tasks/${taskId}`,
                {
                    headers: { 'Authorization': `Bearer ${API_KEY}` }
                }
            );

            const task = statusResponse.data;
            if (task.status === 'succeeded') {
                return task.video_url;
            } else if (task.status === 'failed') {
                throw new Error(task.error_message || '生成失败');
            }
            return null;
        };

        // 执行轮询
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const videoUrl = await checkStatus();
            if (videoUrl) {
                return res.json({ success: true, url: videoUrl });
            }
        }

        res.status(408).json({ success: false, message: '视频生成超时，请稍后重试' });

    } catch (error) {
        console.error('视频生成失败:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: '后端服务异常' });
    }
});

app.listen(PORT, () => {
    console.log(`后端服务已启动: http://localhost:${PORT}`);
    console.log(`API Key 状态: ${API_KEY ? '已配置' : '未配置'}`);
});
