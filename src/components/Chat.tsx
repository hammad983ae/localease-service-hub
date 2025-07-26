import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';

const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatRoomId: ID!) {
    chatMessages(chatRoomId: $chatRoomId) {
      id
      content
      senderType
      senderId
      messageType
      isRead
      createdAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatRoomId: ID!, $content: String!, $messageType: String) {
    sendMessage(chatRoomId: $chatRoomId, content: $content, messageType: $messageType) {
      id
      content
      senderType
      senderId
      messageType
      isRead
      createdAt
    }
  }
`;

const MARK_MESSAGE_AS_READ = gql`
  mutation MarkMessageAsRead($messageId: ID!) {
    markMessageAsRead(messageId: $messageId) {
      id
      isRead
    }
  }
`;

const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatRoomId: ID!) {
    messageAdded(chatRoomId: $chatRoomId) {
      id
      content
      senderType
      senderId
      messageType
      isRead
      createdAt
    }
  }
`;

interface ChatProps {
  chatRoomId: string;
  onClose?: () => void;
}

interface Message {
  id: string;
  content: string;
  senderType: 'user' | 'company';
  senderId: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

const Chat: React.FC<ChatProps> = ({ chatRoomId, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { markAsRead } = useNotifications();
  const client = useApolloClient();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatRoomId },
  });

  // Real-time subscription for new messages
  const { data: subscriptionData } = useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { chatRoomId },
    skip: !chatRoomId,
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [markMessageAsRead] = useMutation(MARK_MESSAGE_AS_READ);

  const messages = data?.chatMessages || [];
  
  // Add new messages from subscription to the list
  useEffect(() => {
    if (subscriptionData?.messageAdded) {
      const newMessage = subscriptionData.messageAdded;
      console.log('Chat received new message:', newMessage);
      // Check if message is not already in the list
      if (!messages.find(msg => msg.id === newMessage.id)) {
        // Update the cache with the new message
        client.cache.modify({
          fields: {
            chatMessages(existingMessages = []) {
              return [...existingMessages, newMessage];
            },
          },
        });
      }
    }
  }, [subscriptionData, messages, client.cache]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when they're received
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessages = messages.filter(
        (msg: Message) => 
          !msg.isRead && 
          msg.senderId !== user.id
      );
      
      unreadMessages.forEach((message: Message) => {
        markMessageAsRead({ variables: { messageId: message.id } }).catch(console.error);
      });
      
      // Mark chat as read in notifications
      if (unreadMessages.length > 0) {
        markAsRead(chatRoomId);
      }
    }
  }, [messages, user, markMessageAsRead, markAsRead, chatRoomId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        variables: {
          chatRoomId,
          content: newMessage.trim(),
          messageType: 'text'
        }
      });
      setNewMessage('');
      refetch();
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error loading messages: {error.message}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Secure Chat
          </CardTitle>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea ref={scrollAreaRef} className="h-96">
          <div className="space-y-4 pr-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message: Message) => {
                const isOwnMessage = message.senderId === user?.id;
                const isCompany = message.senderType === 'company';
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {isCompany ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-lg px-3 py-2 ${
                          isOwnMessage 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.createdAt)}
                          </span>
                          {isOwnMessage && (
                            <Badge variant="secondary" className="text-xs">
                              {message.isRead ? 'Read' : 'Sent'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isSending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chat; 