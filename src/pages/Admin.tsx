
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminDashboard from '@/components/AdminDashboard';
import AdminChat from '@/components/AdminChat';
import ChatBot from '@/components/ChatBot';
import { BarChart3, MessageSquare, Settings, Users, TrendingUp } from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="saas-layout">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                  Admin Dashboard
                </h1>
                <p className="text-xl text-muted-foreground">
                  Manage your platform and monitor performance
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="stats-card animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">1,234</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                    <p className="text-3xl font-bold">567</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <p className="text-3xl font-bold">$45,678</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="saas-card">
            <CardContent className="p-6">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="dashboard" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard" className="space-y-6">
                  <AdminDashboard />
                </TabsContent>
                
                <TabsContent value="chat" className="space-y-6">
                  <AdminChat />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ChatBot userType="admin" />
    </div>
  );
};

export default Admin;
