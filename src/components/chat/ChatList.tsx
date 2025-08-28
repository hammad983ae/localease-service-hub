import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Clock, MessageCircle, Play, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatRoom {
  _id: string;
  participants: any[];
  lastMessage?: string;
  lastMessageAt?: string;
  chatType?: string;
  status?: string;
  createdAt?: string;
}

interface ChatListProps {
  showChatList: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredChatRooms: ChatRoom[];
  selectedChatRoom: ChatRoom | null;
  setSelectedChatRoom: (room: ChatRoom) => void;
  setShowChatList: (show: boolean) => void;
  user: any;
}

export const ChatList: React.FC<ChatListProps> = ({
  showChatList,
  searchQuery,
  setSearchQuery,
  filteredChatRooms,
  selectedChatRoom,
  setSelectedChatRoom,
  setShowChatList,
  user
}) => {
  const getParticipantInfo = (room: ChatRoom) => {
    if (room.participants && room.participants.length > 0) {
      const participant = room.participants.find((p: any) => p._id !== user?.id);
      if (participant) {
        return {
          name: participant.full_name || participant.email || 'Unknown User',
          role: participant.role || 'user',
          avatar: participant.avatar
        };
      }
    }
    return { name: 'Unknown User', role: 'user', avatar: undefined };
  };

  if (!showChatList) {
    return null;
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>
      
      <ScrollArea className="h-[520px]">
        <div className="p-2">
          {filteredChatRooms.map((room) => {
            const participant = getParticipantInfo(room);
            const isUnread = room.lastMessage && !room.lastMessage.includes('You:');
            
            return (
              <div
                key={room._id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedChatRoom?._id === room._id ? 'bg-purple-50 border border-purple-200' : ''
                }`}
                onClick={() => {
                  setSelectedChatRoom(room);
                  setShowChatList(false);
                }}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {participant.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate">
                      {participant.name}
                    </span>
                    {room.lastMessageAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(room.lastMessageAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="truncate">
                      {room.lastMessage || 'No messages yet'}
                    </span>
                    {isUnread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {participant.role}
                    </Badge>
                    {room.chatType && (
                      <Badge variant="secondary" className="text-xs">
                        {room.chatType}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredChatRooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No chat rooms found</p>
              <p className="text-sm">Start a conversation to see it here</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
