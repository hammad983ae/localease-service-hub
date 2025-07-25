import React, { useEffect, useRef } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationSound: React.FC = () => {
  const { unreadCount } = useNotifications();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevUnreadCount = useRef(0);

  useEffect(() => {
    // Play notification sound when unread count increases
    if (unreadCount > prevUnreadCount.current && unreadCount > 0) {
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
    >
      <source src="/notification.mp3" type="audio/mpeg" />
      <source src="/notification.wav" type="audio/wav" />
    </audio>
  );
};

export default NotificationSound; 