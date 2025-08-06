'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiService } from '@/services/api';
import { User } from '@/types';

export default function UserSelector() {
  const { currentUser, setCurrentUser, users, setUsers } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const allUsers = await apiService.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) return;

    setIsLoading(true);
    try {
      const newUser = await apiService.createUser(formData);
      setUsers([...users, newUser]);
      setFormData({ username: '', email: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectUser = (user: User) => {
    setCurrentUser(user);
  };

  const resetUserSelection = () => {
    setCurrentUser(null);
  };

  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_64px_rgba(0,0,0,0.4)] transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">👥</span>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            User Hub
          </h2>
        </div>
        <div className="relative">
          <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full animate-ping absolute"></div>
          <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"></div>
        </div>
      </div>
      
      {currentUser ? (
        <div className="mb-8 p-6 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl border border-cyan-400/30 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center mr-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white font-bold text-xl">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-xl mb-1">{currentUser.username}</h3>
              <p className="text-cyan-200 text-sm mb-2">{currentUser.email}</p>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-cyan-400/20 text-cyan-300 rounded-full text-xs font-medium">Active User</span>
              </div>
            </div>
          </div>
          <button
            onClick={resetUserSelection}
            className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 font-semibold border border-white/20 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            Change User
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-8 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            users.map((user, index) => (
              <button
                key={user.id}
                onClick={() => selectUser(user)}
                className="w-full p-5 text-left border border-white/10 rounded-2xl hover:bg-gradient-to-r hover:from-cyan-500/20 hover:via-blue-500/20 hover:to-purple-500/20 hover:border-cyan-400/50 transition-all duration-400 group transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-tr from-slate-600 via-slate-700 to-slate-800 group-hover:from-cyan-500 group-hover:via-blue-600 group-hover:to-purple-700 rounded-xl flex items-center justify-center mr-4 transition-all duration-400 shadow-lg transform group-hover:rotate-12">
                    <span className="text-slate-200 group-hover:text-white text-sm font-bold transition-colors duration-400">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white group-hover:text-cyan-100 transition-colors duration-400 mb-1">{user.username}</div>
                    <div className="text-sm text-slate-300 group-hover:text-cyan-200 transition-colors duration-400 mb-1">{user.email}</div>
                    {user._count && (
                      <div className="text-xs text-slate-400 group-hover:text-cyan-300 transition-colors duration-400">
                        {user._count.followers} followers • {user._count.following} following
                      </div>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">→</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white py-4 px-6 rounded-2xl hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 transition-all duration-500 font-bold shadow-2xl border border-cyan-400/30 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
        >
          <span className="flex items-center justify-center space-x-3">
            <span className="text-2xl">✨</span>
            <span>Add New User</span>
            <span className="text-2xl">✨</span>
          </span>
        </button>
      ) : (
        <form onSubmit={createNewUser} className="space-y-5">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter username..."
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              required
              disabled={isLoading}
            />
            <input
              type="email"
              placeholder="Enter email address..."
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white py-4 px-6 rounded-2xl hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 transition-all duration-500 font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              disabled={isLoading}
              className="flex-1 bg-white/10 text-slate-300 py-4 px-6 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold border border-white/20 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}