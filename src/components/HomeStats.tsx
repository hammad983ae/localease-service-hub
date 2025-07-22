
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Star, Clock } from 'lucide-react';

const HomeStats: React.FC = () => {
  const stats = [
    {
      icon: Users,
      label: 'Happy Customers',
      value: '10,000+',
      color: 'text-blue-600'
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: '4.9/5',
      color: 'text-yellow-600'
    },
    {
      icon: TrendingUp,
      label: 'Completed Jobs',
      value: '25,000+',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: '< 2hrs',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4 text-center">
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-lg font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HomeStats;
