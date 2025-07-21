
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react';

const Support: React.FC = () => {
  const { t } = useLanguage();

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat'
    },
    {
      icon: Phone,
      title: 'Call Support',
      description: 'Speak directly with an agent',
      action: 'Call Now'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email',
      action: 'Send Email'
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Find answers to common questions',
      action: 'View FAQ'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('nav.support')}
        </h1>
        <p className="text-muted-foreground">
          How can we help you today?
        </p>
      </div>

      <div className="space-y-4">
        {supportOptions.map((option) => (
          <Card key={option.title} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <option.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{option.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {option.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {option.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Support;
