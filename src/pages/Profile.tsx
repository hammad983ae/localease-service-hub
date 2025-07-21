
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Settings, Save, Edit, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: data.email || user.email || '',
        phone: '',
        address: ''
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        email: profile.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {profile.full_name || 'User Profile'}
          </h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        {/* Profile Information Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6" />
                <span>Personal Information</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
                className="text-white hover:bg-white/20"
              >
                {isEditing ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t('common.name')}
                </Label>
                <Input
                  id="name"
                  value={profile.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={!isEditing}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('common.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  {t('common.phone')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="+1 234 567 8900"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  {t('common.address')}
                </Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  placeholder="123 Main St, City, Country"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <Settings className="h-6 w-6" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <Button variant="outline" className="w-full justify-start h-14 text-left hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
              <Mail className="h-5 w-5 mr-3 text-blue-500" />
              <div>
                <div className="font-medium">Notification Preferences</div>
                <div className="text-sm text-muted-foreground">Manage how you receive updates</div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-14 text-left hover:bg-green-50 hover:border-green-300 transition-all duration-200">
              <MapPin className="h-5 w-5 mr-3 text-green-500" />
              <div>
                <div className="font-medium">Saved Addresses</div>
                <div className="text-sm text-muted-foreground">Manage your delivery locations</div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-14 text-left hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
              <Phone className="h-5 w-5 mr-3 text-purple-500" />
              <div>
                <div className="font-medium">Emergency Contacts</div>
                <div className="text-sm text-muted-foreground">Add trusted contacts for emergencies</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
