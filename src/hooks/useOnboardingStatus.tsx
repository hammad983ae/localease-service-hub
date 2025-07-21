
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!user) {
        setOnboardingCompleted(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching onboarding status:', error);
          setOnboardingCompleted(false);
        } else {
          setOnboardingCompleted(data?.onboarding_completed || false);
        }
      } catch (error) {
        console.error('Error:', error);
        setOnboardingCompleted(false);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [user]);

  const markOnboardingComplete = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (!error) {
        setOnboardingCompleted(true);
      } else {
        console.error('Error updating onboarding status:', error);
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  return {
    onboardingCompleted,
    loading,
    markOnboardingComplete,
  };
};
