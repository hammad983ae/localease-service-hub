import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '@/components/Seo';
import ChatList from '@/components/ChatList';

const Chats: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <>
      <Seo title="LocalEase | Chats" description="Chat with providers and manage conversations." />
      <div className="saas-layout">
        <ChatList initialBookingId={bookingId} />
      </div>
    </>
  );
};

export default Chats; 