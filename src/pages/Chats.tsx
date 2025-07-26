import React from 'react';
import ChatList from '@/components/ChatList';

const Chats: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="py-6">
        <ChatList />
      </div>
    </div>
  );
};

export default Chats; 