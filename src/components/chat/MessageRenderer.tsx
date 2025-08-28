import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck, Eye, DollarSign, Building2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'user' | 'company' | 'admin';
  createdAt: string;
  isRead: boolean;
  messageType: 'text' | 'quote' | 'company_profile';
  quote?: any;
  companyProfile?: any;
  views?: number;
}

interface MessageRendererProps {
  msg: Message;
  isOwnMessage: boolean;
  user: any;
  acceptQuote: (messageId: string, quoteData: any) => void;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({
  msg,
  isOwnMessage,
  user,
  acceptQuote
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageAlignment = (message: Message) => {
    // Admin messages should always be on the left
    if (message.senderType === 'admin') {
      return 'left';
    }
    
    // Company messages should be on the left
    if (message.senderType === 'company') {
      return 'left';
    }
    
    // User messages should be on the right if they're the current user
    if (message.senderId === user?.id) {
      return 'right';
    }
    
    // Other user messages should be on the left
    return 'left';
  };

  const renderMessageContent = (msg: Message) => {
    switch (msg.messageType) {
      case 'quote':
        if (msg.quote && typeof msg.quote === 'object') {
          return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Quote</span>
              </div>
              <div className="text-lg font-bold text-blue-900">
                ${typeof msg.quote.amount === 'number' ? msg.quote.amount : 'N/A'}
              </div>
              {msg.quote.status === 'pending' && user && user.role === 'user' && (
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => acceptQuote(msg.id, msg.quote)}
                >
                  Accept Quote
                </Button>
              )}
              {msg.quote.status === 'accepted' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Accepted
                </Badge>
              )}
            </div>
          );
        }
        return msg.content;
      
      case 'company_profile':
        if (msg.companyProfile && typeof msg.companyProfile === 'object') {
          return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-800">Company Profile</span>
              </div>
              <div className="font-semibold text-gray-900">
                {typeof msg.companyProfile.companyName === 'string' ? msg.companyProfile.companyName : 'Company'}
              </div>
              <div className="text-sm text-gray-600">
                {Array.isArray(msg.companyProfile.services) ? msg.companyProfile.services.join(', ') : 'Services not available'}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">
                  Rating: {typeof msg.companyProfile.rating === 'number' ? msg.companyProfile.rating : 'N/A'}/5
                </span>
                <span className="text-sm text-gray-600">
                  ({typeof msg.companyProfile.totalReviews === 'number' ? msg.companyProfile.totalReviews : 0} reviews)
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Price Range: {typeof msg.companyProfile.priceRange === 'string' ? msg.companyProfile.priceRange : 'Not specified'}
              </div>
            </div>
          );
        }
        return msg.content;
      
      default:
        return msg.content;
    }
  };

  const senderName = msg.senderType === 'user' ? 'You' : 
                     msg.senderType === 'company' ? 'Company' : 'Admin';

  const messageAlignment = getMessageAlignment(msg);
  const isOwn = messageAlignment === 'right';

  return (
    <div
      className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
            {senderName[0]}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-xs ${isOwn ? 'order-1' : 'order-2'}`}>
        <div className={`rounded-lg p-3 ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {renderMessageContent(msg)}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(msg.createdAt)}</span>
          {isOwn && (
            <div className="flex items-center gap-1">
              {msg.isRead ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
          {msg.views && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{msg.views}</span>
            </div>
          )}
        </div>
      </div>
      
      {isOwn && user && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
            {typeof user.full_name === 'string' ? user.full_name[0] : 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
