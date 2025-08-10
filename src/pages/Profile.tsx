import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useQuery, useMutation } from '@apollo/client';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Settings, 
  LogOut, 
  Edit2, 
  Save, 
  X, 
  FileText, 
  DollarSign, 
  Calendar,
  User,
  Shield,
  CreditCard,
  Bell
} from 'lucide-react';
import QuoteDocuments from '@/components/QuoteDocuments';

const MY_PROFILE_QUERY = gql`
  query MyProfile {
    myProfile {
      id
      full_name
      phone
      address
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($full_name: String, $phone: String, $address: String) {
    updateUserProfile(full_name: $full_name, phone: $phone, address: $address) {
      id
      full_name
      phone
      address
    }
  }
`;

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data, loading, error, refetch } = useQuery(MY_PROFILE_QUERY, { fetchPolicy: 'network-only' });
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data?.myProfile) {
      setFormData({
        full_name: data.myProfile.full_name || '',
        phone: data.myProfile.phone || '',
        address: data.myProfile.address || ''
      });
    }
  }, [data]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    if (data?.myProfile) {
      setFormData({
        full_name: data.myProfile.full_name || '',
        phone: data.myProfile.phone || '',
        address: data.myProfile.address || ''
      });
    }
  };

  const handleSave = async () => {
    setErrMsg(null);
    setSuccess(null);
    try {
      await updateUserProfile({ variables: formData });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      setErrMsg(err.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="saas-layout">
        <div className="section-padding">
          <div className="container-modern">
            <div className="space-y-8">
              <div className="loading-skeleton h-8 w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="loading-skeleton h-32"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saas-layout">
        <div className="section-padding">
          <div className="container-modern">
            <Card className="saas-card">
              <CardContent className="p-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
                  <Settings className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Error Loading Profile</h3>
                  <p className="text-muted-foreground">
                    {error.message}
                  </p>
                </div>
                <Button 
                  className="btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const userName = user?.full_name || user?.email || 'User';
  const firstName = userName.split(' ')[0];

  return (
    <div className="saas-layout">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-white text-xl">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                  Profile
                </h1>
                <p className="text-xl text-muted-foreground">
                  Hi {firstName}, manage your account information
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="stats-card animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                    <p className="text-3xl font-bold">24</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                    <p className="text-3xl font-bold">$1,234</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-3xl font-bold">2024</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <User className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="saas-card">
            <CardContent className="p-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="profile" className="gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Info Card */}
                    <Card className="saas-card">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Personal Information</CardTitle>
                              <p className="text-sm text-muted-foreground">Update your personal details</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={isEditing ? handleCancel : handleEdit}
                            className="btn-secondary gap-2"
                          >
                            {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                            {isEditing ? 'Cancel' : 'Edit'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {success && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-green-700 text-sm">{success}</p>
                          </div>
                        )}
                        {errMsg && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-700 text-sm">{errMsg}</p>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                              id="full_name"
                              value={formData.full_name}
                              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                              disabled={!isEditing}
                              placeholder="Enter your full name"
                              className="input-modern"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              disabled={!isEditing}
                              placeholder="Enter your phone number"
                              className="input-modern"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              disabled={!isEditing}
                              placeholder="Enter your address"
                              className="input-modern"
                            />
                          </div>
                        </div>
                        
                        {isEditing && (
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button onClick={handleSave} className="btn-primary gap-2">
                              <Save className="h-4 w-4" />
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Account Info Card */}
                    <Card className="saas-card">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Account Information</CardTitle>
                            <p className="text-sm text-muted-foreground">Your account details</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Role</p>
                              <p className="text-sm text-muted-foreground capitalize">{user?.role || 'User'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Member Since</p>
                              <p className="text-sm text-muted-foreground">January 2024</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-6">
                  <QuoteDocuments />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="saas-card">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            <p className="text-sm text-muted-foreground">Manage your notifications</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                            <div>
                              <p className="text-sm font-medium">Email Notifications</p>
                              <p className="text-xs text-muted-foreground">Receive updates via email</p>
                            </div>
                            <Badge className="badge-success">Enabled</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                            <div>
                              <p className="text-sm font-medium">SMS Notifications</p>
                              <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
                            </div>
                            <Badge className="badge-secondary">Disabled</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="saas-card">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-white">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Billing</CardTitle>
                            <p className="text-sm text-muted-foreground">Manage your billing</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                            <div>
                              <p className="text-sm font-medium">Payment Method</p>
                              <p className="text-xs text-muted-foreground">Visa ending in 4242</p>
                            </div>
                            <Button variant="outline" size="sm" className="btn-secondary">
                              Update
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                            <div>
                              <p className="text-sm font-medium">Billing Address</p>
                              <p className="text-xs text-muted-foreground">123 Main St, City, State</p>
                            </div>
                            <Button variant="outline" size="sm" className="btn-secondary">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
