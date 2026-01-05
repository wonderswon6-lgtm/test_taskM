'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GoogleIcon } from '@/components/GoogleIcon';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const { toast } = useToast();
  
  const authBackgroundImage = PlaceHolderImages.find(p => p.id === 'auth-background');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      await auth.login(email, password);
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    try {
      await auth.loginWithGoogle();
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const loading = auth?.loading;

  return (
    <div className="relative min-h-screen w-full">
      {authBackgroundImage && (
        <Image
          src={authBackgroundImage.imageUrl}
          alt={authBackgroundImage.description}
          fill
          className="object-cover"
          data-ai-hint={authBackgroundImage.imageHint}
        />
      )}
      <div className="relative z-10 grid min-h-screen grid-cols-1 bg-black/20 lg:grid-cols-2">
        <div className="hidden flex-col justify-center p-12 text-white lg:flex">
          <h1 className="font-headline text-5xl font-bold">
            TaskFlow
          </h1>
          <p className="mt-4 max-w-md text-lg">
            Organize Your Life, One Task at a Time.
          </p>
        </div>
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back!</CardTitle>
              <CardDescription>
                Enter your credentials to access your task dashboard.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="grid gap-4">
                 <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                     <Link
                        href="#"
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                 <Button className="w-full" type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Sign in with Google
                </Button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  Are you new?{' '}
                  <Link
                    href="/signup"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Create an Account
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
