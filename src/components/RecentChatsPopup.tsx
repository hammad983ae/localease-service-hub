import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Clock, Users, ArrowRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiClient } from '@/api/client';
import { useNotifications } from '@/contexts/NotificationContext';

interface ChatRoom {
  id: string;
  bookingType: string;
  bookingId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface RecentChatsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShowAllChats: () => void;
}

export const RecentChatsPopup: React.FC<RecentChatsPopupProps> = ({
  isOpen,
  onClose,
  onShowAllChats,
}) => {
  const navigate = useNavigate();
  const { unreadCount: totalUnread } = useNotifications();
  const [recentChats, setRecentChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [clickedChatId, setClickedChatId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRecentChats();
      // Focus the first chat room item for keyboard navigation
      const firstChatItem = document.querySelector('[role="button"]') as HTMLElement;
      if (firstChatItem) {
        setTimeout(() => firstChatItem.focus(), 100);
      }
    }
  }, [isOpen]);

  const fetchRecentChats = async () => {
    try {
      setLoading(true);
      const [chatRooms, unreadData] = await Promise.all([
        apiClient.getChatRooms(),
        apiClient.getUnreadCount(),
      ]);

      // Create a map of unread counts by room ID
      const unreadMap = new Map();
      if (unreadData.unreadChats) {
        unreadData.unreadChats.forEach((chat: any) => {
          unreadMap.set(chat.roomId, chat.count);
        });
      }

      // Sort by last message time and limit to 5 most recent
      const sortedChats = chatRooms
        .filter(room => room.isActive) // Only show active chat rooms
        .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
        .slice(0, 5)
        .map(room => ({
          id: room._id || room.id,
          bookingType: room.bookingType || 'General',
          bookingId: room.bookingId || room.quoteId || 'N/A',
          lastMessage: room.lastMessage || 'No messages yet',
          lastMessageTime: room.lastMessageAt,
          unreadCount: unreadMap.get(room._id || room.id) || 0,
        }));

      setRecentChats(sortedChats);
      setUnreadCount(unreadData.unreadCount || 0);
      setError(null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching recent chats:', error);
      setError('Failed to load recent chats');
    } finally {
      setLoading(false);
    }
  };

  const handleChatRoomClick = (chatRoom: ChatRoom) => {
    setClickedChatId(chatRoom.id);
    // Add a small delay to show the click feedback
    setTimeout(() => {
      navigate(`/chats?room=${chatRoom.id}`);
      onClose();
    }, 100);
  };

  const handleShowAllChats = () => {
    onShowAllChats();
    onClose();
  };

  const getBookingTypeInitial = (type: string) => {
    switch (type.toLowerCase()) {
      case 'moving': return 'M';
      case 'disposal': return 'D';
      case 'transport': return 'T';
      default: return '?';
    }
  };

  const getBookingTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'moving': return 'bg-blue-500';
      case 'disposal': return 'bg-green-500';
      case 'transport': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatRelativeTime = (timestamp: string | Date) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 z-50 w-72 sm:w-80 lg:w-96 transform -translate-x-1/2 sm:right-0 sm:transform-none animate-in slide-in-from-top-2 duration-200">
        <Card className="relative w-full bg-white shadow-2xl border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Recent Chats
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRecentChats}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                aria-label="Refresh chat list"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                ) : (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              aria-label="Close recent chats popup"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div aria-live="polite" aria-label="Chat rooms status">
            {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-red-300" />
              <p className="font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecentChats}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          ) : recentChats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent chats</p>
              <p className="text-sm">Start a conversation to see it here</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowAllChats}
                className="mt-3"
              >
                Start New Chat
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-64 sm:max-h-80">
                <div className="space-y-2">
                  {recentChats.map((chatRoom) => (
                    <div
                      key={chatRoom.id}
                      onClick={() => handleChatRoomClick(chatRoom)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleChatRoomClick(chatRoom);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open chat for ${chatRoom.bookingType} booking ${chatRoom.bookingId}`}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-gray-100 ${
                        clickedChatId === chatRoom.id ? 'bg-blue-50 ring-2 ring-blue-200' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-white ${getBookingTypeColor(chatRoom.bookingType)}`}>
                          {getBookingTypeInitial(chatRoom.bookingType)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {chatRoom.bookingType} #{chatRoom.bookingId}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(chatRoom.lastMessageTime)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {chatRoom.lastMessage}
                        </p>
                        
                        {chatRoom.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs px-2 py-1">
                            {chatRoom.unreadCount} unread
                          </Badge>
                        )}
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="pt-4 border-t">
                <Button
                  onClick={handleShowAllChats}
                  variant="outline"
                  className="w-full"
                  aria-label="Navigate to full chats page"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Show all Chats
                </Button>
                <div className="text-center mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    View and manage all your conversations
                  </p>
                  <p className="text-xs text-gray-400">
                    {lastUpdated ? `Updated ${formatRelativeTime(lastUpdated)}` : 'Updated just now'}
                  </p>
                  {recentChats.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
                      <span>•</span>
                      <span>{recentChats.filter(c => c.bookingType === 'moving').length} Moving</span>
                      <span>•</span>
                      <span>{recentChats.filter(c => c.bookingType === 'disposal').length} Disposal</span>
                      <span>•</span>
                      <span>{recentChats.filter(c => c.bookingType === 'transport').length} Transport</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          </div>
        </CardContent>
        </Card>
      </div>
    </>
  );
};
