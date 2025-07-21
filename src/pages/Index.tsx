
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
    
    if (!hasCompletedOnboarding) {
      navigate('/onboarding');
    } else {
      // This component shouldn't render, redirect to home
      navigate('/');
    }
  }, [navigate]);

  return null;
};

export default Index;
