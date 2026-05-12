import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import ImagePage from './pages/ImagePage';
import VideoPage from './pages/VideoPage';

function App() {
  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-cyan-highlight/30">
      <NavBar />
      
      <main className="container mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/image" replace />} />
          <Route path="/image" element={<ImagePage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="*" element={<Navigate to="/image" replace />} />
        </Routes>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-highlight/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}

export default App;
