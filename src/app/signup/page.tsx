'use client';

import { useState, useEffect } from 'react';
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
import { generateBackground } from '@/ai/flows/generate-background-flow';


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const auth = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const result = await generateBackground({ prompt: 'A dynamic and abstract background image representing task completion, with faded tick and untick marks, in a blue and white color scheme.' });
        setBackgroundImage(result.imageUrl);
      } catch (error) {
        console.error('Failed to generate background:', error);
        // Fallback to a default image if generation fails
        setBackgroundImage('https://images.unsplash.com/photo-1559526324-c1f275fbfa32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTY3MDZ8MHwxfHNlYXJjaHw1fHxwbGFubmluZ3xlbnwwfHx8fDE3MTg3NDYyNDJ8MA&ixlib=rb-4.0.3&q=80&w=1080');
      }
    };
    fetchBackground();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      await auth.signup(email, password);
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const loading = auth?.loading;

  return (
    <div className="relative min-h-screen w-full">
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt="AI generated background of tasks"
          fill
          className="object-cover"
          data-ai-hint="tasks checklist"
        />
      ) : (
        <div className="absolute inset-0 bg-secondary animate-pulse" />
      )}
      <div className="relative z-10 grid min-h-screen grid-cols-1 bg-black/20 lg:grid-cols-2">
        <div className="hidden flex-col justify-center p-12 text-white lg:flex">
          <h1 className="font-headline text-5xl font-bold">
            TaskFlow
          </h1>
          <p className="mt-4 max-w-md text-lg">
            Your personal space to organize, track, and complete every task.
          </p>
        </div>
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>
                Get started with TaskFlow for free.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    suppressHydrationWarning
                  />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
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
