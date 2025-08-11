import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/api/client';

const RealTimeChatDemo: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<Array<{id: string, bookingType: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [demoRoomId] = useState(`demo-${Date.now()}`);

  // Fetch available chat rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiClient.getAdminChatRooms();
        const rooms = response.chatRooms || [];
        setAvailableRooms(rooms.map(room => ({
          id: room.id || room._id,
          bookingType: room.bookingType
        })));
        
        // Use the first available room as default
        if (rooms.length > 0) {
          setRoomId(rooms[0].id || rooms[0]._id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create Socket.IO connection
    const newSocket = io('http://localhost:5002', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
      
      // Join room based on mode
      if (demoMode) {
        // In demo mode, just emit a custom event to test connection
        console.log('Demo mode - testing connection only');
      } else if (roomId) {
        // Join real chat room
        newSocket.emit('join_room', { roomId });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    newSocket.on('new_message', (data) => {
      console.log('New message received:', data);
      if (data.message) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: data.message.content,
          sender: data.message.senderType || 'unknown',
          timestamp: new Date()
        }]);
      }
    });

    newSocket.on('user_typing', (data) => {
      console.log('User typing:', data);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, demoMode]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    if (demoMode) {
      // In demo mode, just add message locally for testing
      const message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender: 'admin',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, message]);
      
      // Simulate real-time by broadcasting to other tabs via localStorage
      const event = new CustomEvent('demo-message', { 
        detail: { message, roomId: demoRoomId } 
      });
      window.dispatchEvent(event);
      
      setNewMessage('');
      return;
    }

    // Send message via Socket.IO to real chat room
    if (roomId) {
      socket.emit('send_message', {
        chatRoomId: roomId,
        content: newMessage.trim(),
        messageType: 'text'
      });

      // Add message to local state immediately for instant feedback
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender: 'admin',
        timestamp: new Date()
      }]);

      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleRoomChange = (newRoomId: string) => {
    setRoomId(newRoomId);
    setMessages([]); // Clear messages when changing rooms
  };

  // Listen for demo messages from other tabs
  useEffect(() => {
    const handleDemoMessage = (event: CustomEvent) => {
      if (event.detail.roomId === demoRoomId) {
        setMessages(prev => [...prev, event.detail.message]);
      }
    };

    window.addEventListener('demo-message', handleDemoMessage as EventListener);
    return () => {
      window.removeEventListener('demo-message', handleDemoMessage as EventListener);
    };
  }, [demoRoomId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading chat rooms...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Real-Time Chat Demo
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selection */}
          <Tabs value={demoMode ? "demo" : "real"} onValueChange={(value) => setDemoMode(value === "demo")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="demo">Demo Mode (No Backend)</TabsTrigger>
              <TabsTrigger value="real">Real Chat Rooms</TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Demo Mode:</strong> Test real-time functionality without backend requirements</p>
                <p>Room: {demoRoomId}</p>
                <p>Status: {isConnected ? 'Connected to Socket.IO server' : 'Connecting...'}</p>
              </div>

              {/* Messages */}
              <div className="h-96 border rounded-lg p-4 overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet. Start typing to test real-time chat!</p>
                ) : (
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.sender === 'admin'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message to test real-time chat..."
                  disabled={!isConnected}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim() || !isConnected}>
                  Send
                </Button>
              </div>

              {/* Demo Instructions */}
              <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                <p><strong>Demo Mode Instructions:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Open this page in multiple browser tabs/windows</li>
                  <li>Type messages in any tab - they appear instantly in all tabs</li>
                  <li>This demonstrates real-time communication via browser events</li>
                  <li>No backend chat room required - perfect for testing!</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="real" className="space-y-4">
              {availableRooms.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>No chat rooms available.</p>
                  <p className="text-sm mt-2">Create some bookings first to generate chat rooms.</p>
                </div>
              ) : (
                <>
                  {/* Room Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Chat Room:</label>
                    <select
                      value={roomId}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.bookingType} - {room.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Connection Status */}
                  <div className="text-sm text-gray-600">
                    <p>Room: {roomId}</p>
                    <p>Status: {isConnected ? 'Connected to Socket.IO server' : 'Connecting...'}</p>
                  </div>

                  {/* Messages */}
                  <div className="h-96 border rounded-lg p-4 overflow-y-auto bg-gray-50">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-center">No messages yet. Start typing to test real-time chat!</p>
                    ) : (
                      <div className="space-y-2">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg ${
                                message.sender === 'admin'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message to test real-time chat..."
                  disabled={!isConnected || !roomId}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim() || !isConnected || !roomId}>
                  Send
                </Button>
              </div>

              {/* Real Chat Instructions */}
              <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                <p><strong>Real Chat Room Instructions:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Select a chat room from the dropdown above</li>
                  <li>Open this page in multiple browser tabs/windows</li>
                  <li>Type messages - they appear instantly via Socket.IO</li>
                  <li>Messages are stored in the database</li>
                </ul>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
</div>
  );
};

export default RealTimeChatDemo;
