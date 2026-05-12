import React, { useState } from 'react';
import { Download, AlertCircle, Play } from 'lucide-react';
import Spinner from '../components/Spinner';

const VideoPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('4s');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const MAX_CHARS = 500;

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length > MAX_CHARS) return;

    setLoading(true);
    setVideoUrl(null);
    
    console.log('Generating video with:', { prompt, duration });

    try {
      const response = await fetch('http://localhost:3000/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration })
      });

      const data = await response.json();
      if (data.success) {
        setVideoUrl(data.url);
      } else {
        window.alert(`生成失败: ${data.message}`);
      }
    } catch (error) {
      window.alert('请求后端服务失败，请确保 server.js 已启动');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const proxyUrl = `http://localhost:3000/api/proxy-download?url=${encodeURIComponent(videoUrl)}`;
    window.location.href = proxyUrl;
  };

  return (
    <div className="pt-24 pb-12 px-4 flex flex-col items-center min-h-screen fade-in">
      <div className="w-full max-w-[640px] glass rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gradient">AI 视频生成</h1>
        
        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">提示词 (Prompt)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入你想要生成的视频画面描述…"
            className={`w-full h-32 bg-white/5 border rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-highlight/50 transition-all resize-none leading-relaxed
              ${prompt.length > MAX_CHARS ? 'border-red-500' : 'border-white/10'}`}
          />
          <div className="flex justify-between mt-2 text-xs">
            <span className={prompt.length > MAX_CHARS ? 'text-red-500 flex items-center' : 'text-gray-500'}>
              {prompt.length > MAX_CHARS && <AlertCircle size={12} className="mr-1" />}
              {prompt.length} / {MAX_CHARS}
            </span>
            {prompt.length > MAX_CHARS && <span className="text-red-500">字数超出上限</span>}
          </div>
        </div>

        {/* Video Duration */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-400 mb-2">视频长度</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-[#1A1D29] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-highlight/50"
          >
            <option>2s</option>
            <option>4s</option>
            <option>6s</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || prompt.length > MAX_CHARS}
          className="w-full py-4 bg-cyan-highlight text-dark-bg font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)] mb-8"
        >
          {loading ? <Spinner /> : '生成视频'}
        </button>

        {/* Result Area */}
        {videoUrl && (
          <div className="space-y-4 fade-in">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20 aspect-video">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-3 flex items-center justify-center space-x-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              <Download size={18} />
              <span>下载高清视频</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
