import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SendBirdChat from '@/components/SendBirdChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { Seo } from '@/components/Seo';

const Chats: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');

  return (
    <>
      <Seo 
        title="Chat Center - LocalEase Service Hub"
        description="Connect with our team and get real-time support for your bookings"
      />
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">💬 Chat Center</h1>
          <p className="text-sm text-muted-foreground">
            Get real-time support for your bookings
          </p>
        </div>

      {/* Chat Interface */}
      <Card className="h-[calc(100vh-200px)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Live Chat</CardTitle>
              <p className="text-xs text-muted-foreground">
                Professional real-time messaging
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              ✅ Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <SendBirdChat chatRoomId={roomId} />
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default Chats; 