import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
  </div>
);

export default LoadingSpinner;
