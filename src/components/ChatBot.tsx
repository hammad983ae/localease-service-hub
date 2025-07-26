
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2,
  User,
  Bot
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  userType?: 'customer' | 'company';
}

const ChatBot: React.FC<ChatBotProps> = ({ userType = 'customer' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: userType === 'company' 
        ? 'Hello! I\'m here to help you manage your bookings and answer any questions about your services.' 
        : 'Hello! I\'m here to help you with your bookings and answer any questions you might have.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(newMessage, userType),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (message: string, type: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (type === 'company') {
      if (lowerMessage.includes('booking') || lowerMessage.includes('request')) {
        return 'You can view and manage all your service requests in the "Service Requests" tab. You can accept or reject pending requests there.';
      }
      if (lowerMessage.includes('profile') || lowerMessage.includes('update')) {
        return 'You can update your company profile information in the "Company Profile" tab, including your services and contact details.';
      }
      if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return 'I can help you with managing bookings, updating your profile, or answering questions about using the platform. What would you like to know?';
      }
    } else {
      if (lowerMessage.includes('book') || lowerMessage.includes('service')) {
        return 'You can book moving, transport, or disposal services from the main navigation. Each service has a step-by-step booking process.';
      }
      if (lowerMessage.includes('track') || lowerMessage.includes('booking')) {
        return 'You can track all your bookings in the "My Bookings" section. There you\'ll see the status and details of each service request.';
      }
      if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return 'I can help you with booking services, tracking your requests, or updating your profile. What would you like assistance with?';
      }
    }
    
    return 'I understand you\'re asking about that. Is there something specific I can help you with regarding your bookings or account?';
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 shadow-xl transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-96'
      }`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Support Chat
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-3 py-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === 'bot' && <Bot className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                        {message.sender === 'user' && <User className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                        <span>{message.text}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3 w-3" />
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size="sm" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;
