'use client';

import UserSelector from "@/components/UserSelector";
import NotificationPanel from "@/components/NotificationPanel";
import SocialActions from "@/components/SocialActions";
import { useApp } from "@/contexts/AppContext";

export default function Home() {
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="relative">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 tracking-tight">
              Insyd
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-3xl opacity-20 -z-10"></div>
          </div>
          <p className="text-slate-300 text-lg font-medium">
            Real-time social notifications that matter
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <UserSelector />
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <SocialActions />
          </div>

          <div className="lg:col-span-1 order-3">
            <NotificationPanel />
          </div>
        </div>

        <footer className="text-center mt-12">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
              <p className="text-slate-200 font-medium text-lg">
                {currentUser ? (
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Connected as {currentUser.username}
                  </span>
                ) : (
                  'Select user to start connecting'
                )}
              </p>
            </div>
            <p className="text-slate-400">
              Powered by Next.js • Express.js • Socket.IO
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
