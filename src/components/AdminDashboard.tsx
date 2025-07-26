import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = {
    totalUsers: 1247,
    activeCompanies: 89,
    totalBookings: 2341,
    revenue: 45680,
    growthRate: 12.5,
    pendingApprovals: 15
  };

  const recentActivity = [
    { type: 'new_user', user: 'John Smith', time: '2 hours ago', status: 'active' },
    { type: 'booking', company: 'Swift Movers', amount: '$340', time: '3 hours ago', status: 'completed' },
    { type: 'company_signup', company: 'Green Disposal Co.', time: '5 hours ago', status: 'pending' },
    { type: 'issue', user: 'Sarah Johnson', issue: 'Payment failed', time: '6 hours ago', status: 'resolved' }
  ];

  const topCompanies = [
    { name: 'Swift Movers', rating: 4.9, bookings: 156, revenue: '$12,450' },
    { name: 'Green Disposal', rating: 4.8, bookings: 142, revenue: '$9,800' },
    { name: 'City Transport', rating: 4.7, bookings: 98, revenue: '$7,650' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Monitor and manage your LocalEase platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-blue-600">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium">Total Users</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+{stats.growthRate}% this month</span>
                  </div>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 font-medium">Active Companies</p>
                  <p className="text-3xl font-bold mt-2">{stats.activeCompanies}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">across 12 cities</span>
                  </div>
                </div>
                <Building2 className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-medium">Revenue</p>
                  <p className="text-3xl font-bold mt-2">${stats.revenue.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">this month</span>
                  </div>
                </div>
                <DollarSign className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            activity.type === 'new_user' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'booking' ? 'bg-green-100 text-green-600' :
                            activity.type === 'company_signup' ? 'bg-purple-100 text-purple-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {activity.type === 'new_user' && <Users className="h-4 w-4" />}
                            {activity.type === 'booking' && <Calendar className="h-4 w-4" />}
                            {activity.type === 'company_signup' && <Building2 className="h-4 w-4" />}
                            {activity.type === 'issue' && <AlertTriangle className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {activity.user || activity.company} 
                              {activity.amount && ` - ${activity.amount}`}
                              {activity.issue && ` - ${activity.issue}`}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                        <Badge variant={
                          activity.status === 'active' || activity.status === 'completed' || activity.status === 'resolved' 
                            ? 'default' : 'secondary'
                        }>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Companies */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCompanies.map((company, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{company.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{company.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{company.bookings} bookings</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-600">{company.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">User Satisfaction</h3>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Rating</span>
                      <span className="font-bold">4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                    <p className="text-xs text-muted-foreground">96% positive feedback</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Platform Usage</h3>
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Active Users</span>
                      <span className="font-bold">2,341</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <p className="text-xs text-muted-foreground">78% of registered users</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Response Time</h3>
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Response</span>
                      <span className="font-bold">2.3 hrs</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">15% faster than last month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tab contents would go here */}
          <TabsContent value="users">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground">Detailed user analytics and management tools coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Company Management</h3>
                  <p className="text-muted-foreground">Company onboarding, verification, and performance tracking.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Booking Analytics</h3>
                  <p className="text-muted-foreground">Comprehensive booking data, trends, and insights.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-muted-foreground">Revenue analytics, growth metrics, and predictive insights.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
