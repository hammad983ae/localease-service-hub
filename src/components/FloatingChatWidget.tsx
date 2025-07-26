
import React, { useState } from 'react';
import { MessageCircle, X, Minus, ChevronDown, Sparkles } from 'lucide-react';
import ChatList from './ChatList';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const FloatingChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {/* Enhanced Floating Chat Button */}
      {!open && (
        <div className="fixed z-50 bottom-6 right-6">
          <button
            className="group relative bg-gradient-to-r from-primary via-blue-600 to-primary text-white rounded-full shadow-2xl p-4 hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center overflow-hidden"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full animate-pulse"></div>
            
            {/* Main icon with glow effect */}
            <div className="relative z-10 flex items-center justify-center">
              <MessageCircle className="h-7 w-7 drop-shadow-sm" />
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75"></div>
            </div>
            
            {/* Floating sparkles animation */}
            <div className="absolute top-1 right-1 animate-bounce">
              <Sparkles className="h-3 w-3 text-yellow-300" />
            </div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-30"></div>
          </button>
        </div>
      )}

      {/* Enhanced Floating Chat Box */}
      {open && (
        <div
          className={cn(
            'fixed z-50 flex flex-col shadow-2xl rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20',
            'transition-all duration-500 ease-in-out transform',
            minimized ? 'h-16 w-80 scale-95' : 'h-[500px] w-[380px] scale-100',
            'bottom-6 right-6'
          )}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Enhanced Header with glassmorphism */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-gradient-to-r from-primary/90 to-blue-600/90 rounded-t-3xl backdrop-blur-sm">
            <div className="flex items-center gap-3 text-white font-semibold">
              <div className="relative">
                <MessageCircle className="h-6 w-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">Chat</span>
                <span className="text-xs text-white/80 font-normal">Always here to help</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110"
                onClick={() => setMinimized((m) => !m)}
                aria-label={minimized ? 'Maximize chat' : 'Minimize chat'}
              >
                {minimized ? <ChevronDown className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
              </button>
              <button
                className="hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110 hover:rotate-90"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Enhanced Chat Content */}
          {!minimized && (
            <div className="flex-1 overflow-hidden bg-gradient-to-b from-white/50 to-white/80 backdrop-blur-sm rounded-b-3xl">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <ChatList />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-20 right-4 opacity-10">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;
