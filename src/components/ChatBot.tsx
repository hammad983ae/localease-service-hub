import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Send, 
  Bot, 
  User,
  Sparkles,
  Clock,
  Zap,
  Heart
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatBotProps {
  userType: 'customer' | 'company' | 'admin';
}

const ChatBot: React.FC<ChatBotProps> = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm your LocalEase assistant. How can I help you ${
        userType === 'company' ? 'manage your business' : 
        userType === 'admin' ? 'manage the platform' : 
        'find the perfect service'
      } today?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getBotResponse = (userMessage: string) => {
    const responses = userType === 'company' 
      ? [
          "I can help you manage your bookings, update your services, or analyze your performance metrics.",
          "Would you like me to show you recent customer inquiries or help optimize your service offerings?",
          "I can assist with scheduling, customer communication, or business analytics. What would be most helpful?",
          "Let me help you streamline your operations. Are you looking to improve efficiency or expand your services?"
        ]
      : userType === 'admin'
      ? [
          "I can help you manage the platform, review bookings, and provide customer support.",
          "Would you like me to show you recent bookings that need approval or help with user management?",
          "I can assist with platform analytics, user support, or system administration. What would be most helpful?",
          "Let me help you maintain platform quality. Are you looking to review bookings or assist users?"
        ]
      : [
          "I'm here to help you find the perfect service for your needs! What type of service are you looking for?",
          "I can help you book moving, disposal, or transport services. Would you like me to guide you through the process?",
          "Let me assist you in finding reliable service providers in your area. What's your specific requirement?",
          "I can help you compare services, check availability, or answer any questions about our platform."
        ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(newMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <div className="relative group">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-blue-600/90 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 overflow-hidden"
            size="icon"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 animate-pulse"></div>
            
            <div className="relative z-10 flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-white drop-shadow-lg" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-500 animate-bounce border-2 border-white shadow-lg">
                  {unreadCount}
                </Badge>
              )}
            </div>
            
            {/* Floating animation elements */}
            <div className="absolute top-2 right-2 animate-bounce delay-300">
              <Sparkles className="h-3 w-3 text-yellow-300" />
            </div>
            <div className="absolute bottom-2 left-2 animate-bounce delay-700">
              <Zap className="h-3 w-3 text-blue-300" />
            </div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-1000 opacity-0 group-hover:opacity-30"></div>
          </Button>
          
          {/* Status indicator */}
          <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Online
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Card className={`w-96 transition-all duration-500 shadow-2xl border-0 backdrop-blur-xl bg-white/95 rounded-3xl overflow-hidden ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`} style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }}>
        <CardHeader className="p-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white rounded-t-3xl relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-400/10 via-pink-500/10 to-purple-600/10 animate-pulse"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 bg-white/20 backdrop-blur-sm border-2 border-white/30">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="h-6 w-6 text-white drop-shadow-sm" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg drop-shadow-sm">LocalEase Assistant</h3>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <Heart className="w-3 h-3 text-red-300 animate-pulse" />
                  <span>Here to help you succeed</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-10 w-10 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
              >
                <Minimize2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px] bg-gradient-to-b from-gray-50/80 to-white/90 backdrop-blur-sm">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-4 ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className={`h-10 w-10 flex-shrink-0 shadow-lg ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-primary to-blue-600' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}>
                        <AvatarFallback className="bg-transparent">
                          {message.sender === 'user' ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Bot className="h-5 w-5 text-white" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {message.sender === 'bot' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className={`flex flex-col max-w-[75%] ${
                      message.sender === 'user' ? 'items-end' : 'items-start'
                    }`}>
                      <div className={`rounded-2xl px-5 py-3 shadow-lg backdrop-blur-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white'
                          : 'bg-white/90 text-gray-800 border border-gray-200'
                      }`}>
                        <p className="text-sm leading-relaxed font-medium">{message.text}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-5 w-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/90 rounded-2xl px-5 py-3 shadow-lg backdrop-blur-sm border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <Sparkles className="h-4 w-4 text-blue-500 animate-spin" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-sm rounded-b-3xl">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border-0 bg-white/80 backdrop-blur-sm shadow-inner focus:ring-2 focus:ring-primary/30 rounded-xl"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-xl"
                  size="icon"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by LocalEase AI
                <Heart className="w-3 h-3 text-red-400" />
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;
