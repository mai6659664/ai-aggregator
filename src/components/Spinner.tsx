import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 border-2 border-cyan-highlight border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-medium">生成中...</span>
    </div>
  );
};

export default Spinner;
