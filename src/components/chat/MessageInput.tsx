import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  selectedChatRoom: any;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  selectedChatRoom,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
    setIsTyping(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      // Set typing indicator
      if (!isTyping) {
        setIsTyping(true);
      }
    }
  };

  const handleKeyUp = () => {
    // Clear typing indicator after a delay
    if (isTyping) {
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Smile className="h-4 w-4" />
        </Button>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onKeyUp={handleKeyUp}
            placeholder="Type a message..."
            className="border-0 bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary rounded-full px-4 py-2 resize-none min-h-[40px] max-h-[120px]"
            rows={1}
            disabled={disabled}
          />
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
