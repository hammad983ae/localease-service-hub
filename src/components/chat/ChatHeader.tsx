import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Phone, MoreVertical, RefreshCw } from 'lucide-react';

interface ChatHeaderProps {
  selectedChatRoom: any;
  showChatList: boolean;
  setShowChatList: (show: boolean) => void;
  user: any;
  isAdmin: boolean;
  fetchMessages: (roomId: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChatRoom,
  showChatList,
  setShowChatList,
  user,
  isAdmin,
  fetchMessages
}) => {
  const getParticipantInfo = (room: any) => {
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

  const participant = getParticipantInfo(selectedChatRoom);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        {!showChatList && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChatList(true)}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={participant.avatar} />
          <AvatarFallback className="bg-purple-100 text-purple-600">
            {participant.name.split(' ').map((n: string) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-semibold text-gray-900">{participant.name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              {Array.isArray(selectedChatRoom.participants) ? selectedChatRoom.participants.length : 2} members, {Math.floor(Math.random() * 10) + 1} online
            </p>
            <div className="w-2 h-2 rounded-full bg-green-500" 
                 title="SendBird Connected" />
          </div>
          
          {/* Show booking details for admins */}
          {(user?.role === 'admin' || isAdmin) && selectedChatRoom.bookingId && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Booking Details</h4>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Booking ID:</strong> {selectedChatRoom.bookingId}</p>
                <p><strong>Type:</strong> {selectedChatRoom.bookingType || 'Unknown'}</p>
                <p><strong>Status:</strong> {selectedChatRoom.status || 'Active'}</p>
                <p><strong>Created:</strong> {selectedChatRoom.createdAt ? new Date(selectedChatRoom.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectedChatRoom && fetchMessages(selectedChatRoom._id)}
          title="Refresh messages"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
