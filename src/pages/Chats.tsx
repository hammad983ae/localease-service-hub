import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatList from '@/components/ChatList';

const Chats: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="saas-layout">
      <ChatList initialBookingId={bookingId} />
    </div>
  );
};

export default Chats; 