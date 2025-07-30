
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/components/AdminDashboard';
import AdminChat from '@/components/AdminChat';
import ChatBot from '@/components/ChatBot';
import { BarChart3, MessageSquare } from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="relative">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <AdminDashboard />
        </TabsContent>
        
        <TabsContent value="chat">
          <AdminChat />
        </TabsContent>
      </Tabs>
      
      <ChatBot userType="admin" />
    </div>
  );
};

export default Admin;
