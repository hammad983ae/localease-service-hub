import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatList from '@/components/ChatList';

const Chats: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="container mx-auto px-4">
      <div className="py-6">
        <ChatList initialBookingId={bookingId} />
      </div>
    </div>
  );
};

export default Chats; 