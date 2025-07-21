
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Settings, LogOut, Edit2, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: ''
  });

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('No user');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error('Profile update error:', error);
    },
  });

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  };

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Hi {firstName}, manage your account information
        </p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-blue-50">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your personal details
                </p>
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
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfile.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
              <p className="text-sm text-muted-foreground">
                Manage your account settings
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground mb-2">Account Information</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>• Your data is securely stored and encrypted</p>
          <p>• You can update your information at any time</p>
          <p>• Contact support if you need help with your account</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
