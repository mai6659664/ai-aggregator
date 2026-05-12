import React, { useState, useEffect } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import Spinner from '../components/Spinner';

const ImagePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [model, setModel] = useState('Stable Diffusion XL');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const MAX_CHARS = 500;

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length > MAX_CHARS) return;

    setLoading(true);
    setResultUrl(null);
    
    console.log('Generating with:', { prompt, ratio, model });

    try {
      const response = await fetch('http://localhost:3000/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ratio, model })
      });

      const data = await response.json();
      if (data.success) {
        setResultUrl(data.url);
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
    if (!resultUrl) return;
    const proxyUrl = `http://localhost:3000/api/proxy-download?url=${encodeURIComponent(resultUrl)}`;
    window.location.href = proxyUrl;
  };

  return (
    <div className="pt-24 pb-12 px-4 flex flex-col items-center min-h-screen fade-in">
      <div className="w-full max-w-[640px] glass rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gradient">AI 绘画生成</h1>
        
        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">提示词 (Prompt)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入你想要生成的画面描述…"
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

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Ratio Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">图片比例</label>
            <div className="flex space-x-3">
              {['1:1', '16:9'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all text-sm
                    ${ratio === r 
                      ? 'bg-cyan-highlight/10 border-cyan-highlight text-cyan-highlight' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">模型选择</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#1A1D29] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-highlight/50"
            >
              <option>Stable Diffusion XL</option>
              <option>Stable Diffusion 2.1</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || prompt.length > MAX_CHARS}
          className="w-full py-4 bg-cyan-highlight text-dark-bg font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)] mb-8"
        >
          {loading ? <Spinner /> : '生成图片'}
        </button>

        {/* Result Area */}
        {resultUrl && (
          <div className="space-y-4 fade-in">
            <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-black/20 ${ratio === '1:1' ? 'aspect-square' : 'aspect-video'}`}>
              <img 
                src={resultUrl} 
                alt="Generated AI" 
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-3 flex items-center justify-center space-x-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              <Download size={18} />
              <span>下载高清图片</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePage;
