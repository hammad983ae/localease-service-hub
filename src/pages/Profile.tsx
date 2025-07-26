import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Mail, Phone, MapPin, Settings, LogOut, Edit2, Save, X } from 'lucide-react';

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
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Account Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-gray-50">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Account Actions</CardTitle>
                <p className="text-sm text-muted-foreground">Manage your account settings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={signOut} className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
        {/* Account Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-2">Account Information</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Your data is securely stored and encrypted</p>
              <p>• You can update your information at any time</p>
              <p>• Contact support if you need help with your account</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        {errMsg && <div className="text-red-600 text-sm mt-2">{errMsg}</div>}
      </div>
    </div>
  );
};

export default Profile;
