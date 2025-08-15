
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminDashboard from '@/components/AdminDashboard';
import AdminChat from '@/components/AdminChat';
import ChatBot from '@/components/ChatBot';
import { BarChart3, MessageSquare, Settings, Users, TrendingUp } from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Settings className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                      Admin Dashboard
                    </h1>
                    <Badge variant="secondary" className="text-sm font-medium">
                      Administrator
                    </Badge>
                  </div>
                  <p className="text-xl text-muted-foreground">
                    Manage platform operations and monitor system performance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-beautiful hover:shadow-beautiful-lg transition-all duration-300 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">1,234</p>
                    <p className="text-sm text-green-600 font-medium">+12.5%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-beautiful hover:shadow-beautiful-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                    <p className="text-3xl font-bold">567</p>
                    <p className="text-sm text-green-600 font-medium">+8.2%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-beautiful hover:shadow-beautiful-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">$45,678</p>
                    <p className="text-sm text-green-600 font-medium">+18.3%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-beautiful">
            <CardContent className="p-8">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50 rounded-xl">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center gap-2 h-10 px-6 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                    System Analytics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat" 
                    className="flex items-center gap-2 h-10 px-6 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Support Chat
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard" className="space-y-8 mt-0">
                  <AdminDashboard />
                </TabsContent>
                
                <TabsContent value="chat" className="space-y-6 mt-0">
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
