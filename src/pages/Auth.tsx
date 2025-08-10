
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Seo from '@/components/Seo';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let result;
    if (isLogin) {
      result = await signIn(email, password);
    } else {
      // Pass role based on isCompany
      const role = isCompany ? 'company' : 'user';
      result = await signUp(email, password, fullName, role);
    }
    setLoading(false);
    if (!result?.error) {
      toast({
        title: 'Success',
        description: isLogin ? 'Logged in successfully!' : 'Account created successfully! Please sign in.',
      });
      if (isLogin) {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user?.role === 'admin') navigate('/admin');
        else if (user?.role === 'company') navigate('/company-dashboard');
        else navigate('/home');
      } else {
        if (isCompany) {
          navigate('/company-onboarding');
        } else {
          setIsLogin(true); // Switch to login form after registration
        }
      }
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Authentication failed',
        variant: 'destructive',
      });
    }
  };

    return (<>
      <Seo
        title="LocalEase | Sign in or create account"
        description="Securely sign in or create your LocalEase account for moving, transport, and disposal services."
      />
      <div className="min-h-screen flex flex-col">
        <header className="px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </header>

        <main className="flex-1">
          <section className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Form Card */}
              <article className="order-2 md:order-1">
                <Card className="border border-border/60 shadow-lg bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                  <CardHeader className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {isLogin ? 'Sign in' : 'Create your account'}
                    </h1>
                    <p className="text-muted-foreground">
                      {isLogin ? 'Welcome back to LocalEase' : 'Get started in minutes — it’s free.'}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <Tabs value={isLogin ? 'signin' : 'signup'} onValueChange={(v) => setIsLogin(v === 'signin')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="signin">Sign in</TabsTrigger>
                          <TabsTrigger value="signup">Sign up</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {!isLogin && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Account type</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant={isCompany ? 'default' : 'outline'}
                              onClick={() => setIsCompany(true)}
                              className="h-10 justify-center"
                            >
                              <Building2 className="h-4 w-4 mr-2" />
                              Company
                            </Button>
                            <Button
                              type="button"
                              variant={!isCompany ? 'default' : 'outline'}
                              onClick={() => setIsCompany(false)}
                              className="h-10 justify-center"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Individual
                            </Button>
                          </div>
                        </div>
                      )}

                      {!isLogin && (
                        <div className="space-y-2">
                          <Label htmlFor="name">{isCompany ? 'Company name' : 'Full name'}</Label>
                          <Input
                            id="name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required={!isLogin}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : (isLogin ? 'Sign in' : 'Create account')}
                      </Button>

                      <div className="text-center text-sm">
                        <button
                          type="button"
                          onClick={() => setIsLogin(!isLogin)}
                          className="text-primary hover:underline font-medium"
                        >
                          {isLogin
                            ? "Don't have an account? Sign up"
                            : 'Already have an account? Sign in'
                          }
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </article>

              {/* Marketing Panel */}
              <aside className="order-1 md:order-2 relative rounded-2xl p-8 md:p-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-border/60 shadow-xl overflow-hidden">
                <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
                  <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                  <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
                </div>
                <div className="relative space-y-6">
                  <div className="inline-flex h-10 items-center rounded-full border border-border/60 bg-background/80 px-4 text-sm shadow-sm">
                    <span className="font-medium">LocalEase</span>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">All-in-one local services, built like a SaaS</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• Book moving, transport, and disposal with ease</li>
                    <li>• Real-time chat and quotes</li>
                    <li>• Professional dashboard experience</li>
                  </ul>
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </>);
};

export default Auth;
