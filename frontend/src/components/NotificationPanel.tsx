'use client';

import { useApp } from '@/contexts/AppContext';
import { type Notification } from '@/types';

export default function NotificationPanel() {
  const { notifications, unreadCount, markAsRead } = useApp();

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationConfig = (type: Notification['type']) => {
    switch (type) {
      case 'FOLLOW':
        return {
          emoji: '🤝',
          gradient: 'from-blue-400 via-indigo-500 to-purple-600',
          bgGradient: 'from-blue-500/20 via-indigo-500/20 to-purple-500/20',
          borderColor: 'border-blue-400/40',
          badgeColor: 'bg-gradient-to-r from-blue-500 to-indigo-600'
        };
      case 'POST':
        return {
          emoji: '✨',
          gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
          bgGradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
          borderColor: 'border-emerald-400/40',
          badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-600'
        };
      case 'LIKE':
        return {
          emoji: '💖',
          gradient: 'from-pink-400 via-rose-500 to-red-600',
          bgGradient: 'from-pink-500/20 via-rose-500/20 to-red-500/20',
          borderColor: 'border-pink-400/40',
          badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-600'
        };
      case 'COMMENT':
        return {
          emoji: '💭',
          gradient: 'from-amber-400 via-orange-500 to-yellow-600',
          bgGradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
          borderColor: 'border-amber-400/40',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-600'
        };
      default:
        return {
          emoji: '🔔',
          gradient: 'from-slate-400 via-slate-500 to-slate-600',
          bgGradient: 'from-slate-500/20 via-slate-500/20 to-slate-500/20',
          borderColor: 'border-slate-400/40',
          badgeColor: 'bg-gradient-to-r from-slate-500 to-slate-600'
        };
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_64px_rgba(0,0,0,0.4)] transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-tr from-violet-400 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">🔔</span>
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Activity Center
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg transform hover:scale-105 transition-transform duration-300">
              {unreadCount} new
            </div>
          )}
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-indigo-600 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-indigo-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-violet-500 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-12">
              <span className="text-3xl transform -rotate-12">🎯</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">All Caught Up!</h3>
          <p className="text-slate-300 text-lg mb-2">Your activity center is waiting for action</p>
          <p className="text-slate-400 text-sm">Connect with others and start creating to see notifications here</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {notifications.map((notification, index) => {
            const config = getNotificationConfig(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-6 rounded-2xl border transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] ${
                  notification.read 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                    : `bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} shadow-xl hover:shadow-2xl`
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-tr ${config.gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg transform ${!notification.read ? 'rotate-6' : ''} transition-transform duration-300`}>
                        <span className="text-white text-lg">
                          {config.emoji}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2 text-lg leading-tight">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-bold text-white shadow-lg ${config.badgeColor}`}>
                            {notification.type}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-violet-300 font-medium">NEW</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-200 mb-4 leading-relaxed text-lg">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-white/10 rounded-full"></div>
                        <span className="text-xs text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-700 text-white px-4 py-2 rounded-xl hover:from-violet-400 hover:via-purple-500 hover:to-indigo-600 transition-all duration-300 font-bold shadow-lg transform hover:scale-105 active:scale-95"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {notifications.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm">
            <span>📊</span>
            <span>{notifications.length} total notifications</span>
            <span>•</span>
            <span>{notifications.filter(n => !n.read).length} unread</span>
          </div>
        </div>
      )}
    </div>
  );
}