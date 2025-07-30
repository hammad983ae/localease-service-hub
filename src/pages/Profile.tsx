import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Mail, Phone, MapPin, Settings, LogOut, Edit2, Save, X, FileText, DollarSign, Calendar } from 'lucide-react';
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  const userName = user?.full_name || user?.email || 'User';
  const firstName = userName.split(' ')[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Hi {firstName}, manage your account information</p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Info Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-blue-50">
                      <Mail className="h-6 w-6 text-blue-600" />
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
                    className="gap-2"
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 text-sm">{success}</p>
                  </div>
                )}
                {errMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{errMsg}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
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
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="invoices">
          <QuoteDocuments />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
