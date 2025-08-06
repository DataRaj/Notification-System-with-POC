'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { apiService } from '@/services/api';
import { User, Post } from '@/types';

export default function SocialActions() {
  const { currentUser, users } = useApp();
  const { showToast } = useToast();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [userConnections, setUserConnections] = useState<User[]>([]);
  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [showPostForm, setShowPostForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllPosts = useCallback(async () => {
    try {
      const postData = await apiService.getPosts();
      setAllPosts(postData);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }, []);

  const fetchUserConnections = useCallback(async () => {
    if (!currentUser) return;
    try {
      const connections = await apiService.getUserFollowing(currentUser.id);
      setUserConnections(connections);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  useEffect(() => {
    if (currentUser) {
      fetchUserConnections();
    }
  }, [currentUser, fetchUserConnections]);

  const handleFollowAction = async (userId: string, isCurrentlyFollowing: boolean) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      if (isCurrentlyFollowing) {
        await apiService.unfollowUser(userId, currentUser.id);
      } else {
        await apiService.followUser(userId, currentUser.id);
      }
      
      await fetchUserConnections();
      const targetUser = users?.find(u => u.id === userId);
      const action = isCurrentlyFollowing ? 'Unfollowed' : 'Now following';
      showToast(`${action} ${targetUser?.username || 'user'}`, isCurrentlyFollowing ? 'info' : 'success');
    } catch (error) {
      console.error('Follow action failed:', error);
      showToast('Action failed, please try again', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const submitNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !postForm.title.trim() || !postForm.content.trim()) return;

    setIsLoading(true);
    try {
      const result = await apiService.createPost({
        userId: currentUser.id,
        title: postForm.title.trim(),
        content: postForm.content.trim()
      });
      
      setAllPosts(prev => [result.post, ...prev]);
      setPostForm({ title: '', content: '' });
      setShowPostForm(false);
      
      showToast(`Post published! Reached ${result.notificationsSent} users.`, 'success');
    } catch (error) {
      console.error('Post creation failed:', error);
      showToast('Failed to publish post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isUserFollowed = (userId: string) => {
    return userConnections.some(user => user.id === userId);
  };

  const availableUsers = users.filter(user => user && user.id !== currentUser?.id);

  if (!currentUser) {
    return (
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-slate-600 via-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-12">
              <span className="text-3xl transform -rotate-12">🌟</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Welcome to Social Hub</h3>
          <p className="text-slate-300 text-lg">Choose a user to unlock social features</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="text-center py-16">
          <div className="animate-pulse mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-3xl mx-auto shadow-2xl"></div>
          </div>
          <p className="text-slate-300 text-lg">Loading social network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Post Creation Section */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-400 via-rose-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">✍️</span>
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-rose-500 to-orange-600 bg-clip-text text-transparent">
              Create Story
            </h2>
          </div>
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-orange-600 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-orange-600 rounded-full"></div>
          </div>
        </div>
        
        {!showPostForm ? (
          <button
            onClick={() => setShowPostForm(true)}
            className="w-full bg-gradient-to-r from-pink-500 via-rose-600 to-orange-700 text-white py-6 px-8 rounded-2xl hover:from-pink-400 hover:via-rose-500 hover:to-orange-600 transition-all duration-500 font-bold shadow-2xl border border-pink-400/30 group transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_40px_rgba(236,72,153,0.4)]"
          >
            <span className="flex items-center justify-center space-x-4">
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">🚀</span>
              <span className="text-lg">Share Your Thoughts</span>
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">✨</span>
            </span>
          </button>
        ) : (
          <form onSubmit={submitNewPost} className="space-y-6">
            <input
              type="text"
              placeholder="What's the story about?"
              value={postForm.title}
              onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-lg"
              required
              disabled={isLoading}
            />
            <textarea
              placeholder="Share your amazing story..."
              value={postForm.content}
              onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 h-40 resize-none backdrop-blur-sm text-lg"
              required
              disabled={isLoading}
            />
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-pink-500 via-rose-600 to-orange-700 text-white py-4 px-6 rounded-2xl hover:from-pink-400 hover:via-rose-500 hover:to-orange-600 transition-all duration-500 font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Publishing...' : 'Publish Story'}
              </button>
              <button
                type="button"
                onClick={() => setShowPostForm(false)}
                disabled={isLoading}
                className="flex-1 bg-white/10 text-slate-300 py-4 px-6 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold border border-white/20 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User Connections Section */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">🤝</span>
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Network
            </h2>
          </div>
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-600 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-600 rounded-full"></div>
          </div>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {availableUsers.filter(user => user && user.username).map((user, index) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-6 border border-white/10 rounded-2xl hover:bg-gradient-to-r hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-cyan-500/20 hover:border-emerald-400/50 transition-all duration-400 group transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-tr from-slate-600 via-slate-700 to-slate-800 group-hover:from-emerald-500 group-hover:via-teal-600 group-hover:to-cyan-700 rounded-2xl flex items-center justify-center mr-6 transition-all duration-400 shadow-lg transform group-hover:rotate-6">
                    <span className="text-slate-200 group-hover:text-white font-bold text-lg transition-colors duration-400">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-emerald-100 transition-colors duration-400 text-lg mb-1">{user.username}</div>
                  <div className="text-sm text-slate-300 group-hover:text-emerald-200 transition-colors duration-400 mb-1">{user.email}</div>
                  {user._count && (
                    <div className="text-xs text-slate-400 group-hover:text-emerald-300 transition-colors duration-400">
                      {user._count.followers} followers • {user._count.following} following
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleFollowAction(user.id, isUserFollowed(user.id))}
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${
                  isUserFollowed(user.id)
                    ? 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/20'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 text-white hover:from-emerald-400 hover:via-teal-500 hover:to-cyan-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {isUserFollowed(user.id) ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed Section */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">📰</span>
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Stories Feed
            </h2>
          </div>
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-red-600 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-red-600 rounded-full"></div>
          </div>
        </div>
        
        {allPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 via-orange-600 to-red-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-12">
                <span className="text-3xl transform -rotate-12">📝</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Stories Yet</h3>
            <p className="text-slate-300 text-lg mb-2">Be the first to share something amazing!</p>
            <p className="text-slate-400 text-sm">Your story could inspire others to join the conversation.</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {allPosts.filter(post => post && post.user && post.user.username).slice(0, 8).map((post, index) => (
              <div 
                key={post.id} 
                className="p-6 border border-white/10 rounded-2xl hover:bg-gradient-to-r hover:from-amber-500/20 hover:via-orange-500/20 hover:to-red-500/20 hover:border-amber-400/50 transition-all duration-400 group transform hover:scale-[1.01] active:scale-[0.99]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-tr from-slate-600 via-slate-700 to-slate-800 group-hover:from-amber-500 group-hover:via-orange-600 group-hover:to-red-700 rounded-2xl flex items-center justify-center mr-4 transition-all duration-400 shadow-lg transform group-hover:rotate-3">
                      <span className="text-slate-200 group-hover:text-white text-sm font-bold transition-colors duration-400">
                        {post.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-300 group-hover:text-amber-200 transition-colors duration-400 font-semibold">
                      {post.user.username}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-medium">Story</span>
                      <span className="text-xs text-slate-400 group-hover:text-amber-300 transition-colors duration-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-white group-hover:text-amber-100 mb-3 transition-colors duration-400 text-xl leading-tight">{post.title}</h3>
                <p className="text-slate-300 group-hover:text-amber-200 mb-4 transition-colors duration-400 leading-relaxed text-lg">{post.content}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 group-hover:text-amber-300 transition-colors duration-400">
                    Published {new Date(post.createdAt).toLocaleTimeString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <span className="text-sm">❤️</span>
                    </button>
                    <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <span className="text-sm">💬</span>
                    </button>
                    <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <span className="text-sm">🔄</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}