
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle, 
  Send,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
// TODO: Integrate with Node.js/MongoDB backend for support data
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Support: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general'
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      // TODO: Fetch support data from backend
      return null;
    },
    enabled: !!user,
  });

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the support request to your backend
      // For now, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "Support request sent",
          description: "We'll get back to you within 24 hours.",
        });
        setFormData({ subject: '', message: '', category: 'general' });
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: "How do I book a service?",
      answer: "You can book a service by selecting the service type from the home page, filling out the required information, and submitting your request. You'll receive a confirmation once your booking is processed."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods. Payment is typically processed after the service is completed."
    },
    {
      question: "Can I cancel or reschedule my booking?",
      answer: "Yes, you can cancel or reschedule your booking up to 24 hours before the scheduled time. Please contact support or use the booking management feature in your account."
    },
    {
      question: "Are your services insured?",
      answer: "Yes, all our services are fully insured. We carry comprehensive liability insurance to protect your belongings and property during service delivery."
    },
    {
      question: "How do I track my service request?",
      answer: "You can track your service request in the 'Bookings' section of your account. You'll also receive SMS and email updates throughout the process."
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Support Center
        </h1>
        <p className="text-muted-foreground">
          Hi {firstName}, how can we help you today?
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-blue-50">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Live Chat</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get instant help
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Chat with our support team in real-time for immediate assistance.
            </p>
            <Button className="w-full" variant="outline">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-green-50">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Phone Support</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Call us directly
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Speak with our team Monday to Friday, 9 AM - 6 PM.
            </p>
            <Button className="w-full" variant="outline">
              Call (555) 123-4567
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-purple-50">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Email Support</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Send us a message
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Get detailed help via email within 24 hours.
            </p>
            <Button className="w-full" variant="outline">
              Email Us
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support Hours */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-orange-50">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Support Hours</CardTitle>
              <p className="text-sm text-muted-foreground">
                When our team is available
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-foreground">Monday - Friday</p>
              <p className="text-muted-foreground">9:00 AM - 6:00 PM</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Weekend</p>
              <p className="text-muted-foreground">10:00 AM - 4:00 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gray-50">
              <HelpCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors">
                  <span className="font-medium text-foreground">{item.question}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-blue-50">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Send us a Message</CardTitle>
              <p className="text-sm text-muted-foreground">
                Describe your issue and we'll help you out
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Please provide as much detail as possible about your issue..."
                rows={4}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
