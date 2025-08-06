'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 3500, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Show animation
    setIsVisible(true);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 50);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: '🎉',
          gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
          bgGradient: 'from-emerald-50/90 via-teal-50/90 to-cyan-50/90',
          borderColor: 'border-emerald-200/60',
          textColor: 'text-emerald-800',
          progressColor: 'bg-gradient-to-r from-emerald-400 to-teal-500'
        };
      case 'info':
        return {
          icon: '💡',
          gradient: 'from-blue-400 via-indigo-500 to-purple-600',
          bgGradient: 'from-blue-50/90 via-indigo-50/90 to-purple-50/90',
          borderColor: 'border-blue-200/60',
          textColor: 'text-blue-800',
          progressColor: 'bg-gradient-to-r from-blue-400 to-indigo-500'
        };
      case 'warning':
        return {
          icon: '⚡',
          gradient: 'from-amber-400 via-orange-500 to-red-500',
          bgGradient: 'from-amber-50/90 via-orange-50/90 to-red-50/90',
          borderColor: 'border-amber-200/60',
          textColor: 'text-amber-800',
          progressColor: 'bg-gradient-to-r from-amber-400 to-orange-500'
        };
      case 'error':
        return {
          icon: '🚨',
          gradient: 'from-red-400 via-pink-500 to-rose-600',
          bgGradient: 'from-red-50/90 via-pink-50/90 to-rose-50/90',
          borderColor: 'border-red-200/60',
          textColor: 'text-red-800',
          progressColor: 'bg-gradient-to-r from-red-400 to-pink-500'
        };
      default:
        return {
          icon: '🎉',
          gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
          bgGradient: 'from-emerald-50/90 via-teal-50/90 to-cyan-50/90',
          borderColor: 'border-emerald-200/60',
          textColor: 'text-emerald-800',
          progressColor: 'bg-gradient-to-r from-emerald-400 to-teal-500'
        };
    }
  };

  const config = getTypeConfig();

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <div 
        className={`transform transition-all duration-500 ease-out ${
          isVisible 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <div className={`${config.bgGradient} ${config.borderColor} border-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-all duration-300 max-w-sm backdrop-blur-xl`}>
          {/* Progress bar */}
          <div className="h-1 bg-gray-200/30 rounded-t-xl overflow-hidden">
            <div 
              className={`h-full ${config.progressColor} transition-all duration-100 ease-linear rounded-t-xl`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex items-start">
              <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center mr-4 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                <span className="text-white text-lg">
                  {config.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${config.textColor} font-semibold leading-relaxed mb-1`}>
                  {message}
                </p>
                <p className="text-gray-600 text-xs">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-200/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}