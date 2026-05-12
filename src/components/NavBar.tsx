import React from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Video } from 'lucide-react';

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F111A] border-b border-white/10 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-cyan-highlight rounded-lg flex items-center justify-center">
            <span className="text-dark-bg font-bold">AI</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">AI 生成聚合</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <NavLink 
            to="/image" 
            className={({ isActive }) => `
              flex items-center space-x-2 h-16 border-b-2 transition-all duration-300
              ${isActive ? 'border-cyan-highlight text-cyan-highlight' : 'border-transparent text-gray-400 hover:text-white'}
            `}
          >
            <Image size={18} />
            <span className="font-medium">AI 绘画</span>
          </NavLink>

          <NavLink 
            to="/video" 
            className={({ isActive }) => `
              flex items-center space-x-2 h-16 border-b-2 transition-all duration-300
              ${isActive ? 'border-cyan-highlight text-cyan-highlight' : 'border-transparent text-gray-400 hover:text-white'}
            `}
          >
            <Video size={18} />
            <span className="font-medium">AI 视频</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
