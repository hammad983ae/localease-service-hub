import React, { useState } from 'react';
import { MessageCircle, X, Minus, ChevronDown } from 'lucide-react';
import ChatList from './ChatList';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const FloatingChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Positioning for the floating widget
  // (could be made draggable in the future)
  const widgetPosition = {
    bottom: 24,
    right: 24,
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          className="fixed z-50 bottom-6 right-6 bg-primary text-white rounded-full shadow-lg p-4 hover:scale-105 transition-transform flex items-center justify-center"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}

      {/* Floating Chat Box */}
      {open && (
        <div
          className={cn(
            'fixed z-50 flex flex-col shadow-2xl rounded-2xl bg-white border border-gray-200',
            minimized ? 'h-16 w-80' : 'h-[500px] w-[380px]',
            'bottom-6 right-6'
          )}
          style={widgetPosition}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-primary to-blue-600 rounded-t-2xl">
            <div className="flex items-center gap-2 text-white font-semibold">
              <MessageCircle className="h-5 w-5" />
              <span>Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="hover:bg-white/10 rounded p-1"
                onClick={() => setMinimized((m) => !m)}
                aria-label={minimized ? 'Maximize chat' : 'Minimize chat'}
              >
                {minimized ? <ChevronDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </button>
              <button
                className="hover:bg-white/10 rounded p-1"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!minimized && (
            <div className="flex-1 overflow-y-auto bg-white rounded-b-2xl">
              <ChatList />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget; 