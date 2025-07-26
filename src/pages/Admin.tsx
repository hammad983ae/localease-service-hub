
import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import ChatBot from '@/components/ChatBot';

const Admin: React.FC = () => {
  return (
    <div className="relative">
      <AdminDashboard />
      <ChatBot userType="company" />
    </div>
  );
};

export default Admin;
