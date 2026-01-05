'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="container mx-auto flex items-center justify-between p-4">
        <h1 className="font-headline text-2xl font-bold text-primary">
          TaskFlow
        </h1>
        <ThemeToggle />
      </header>

      <main className="flex flex-grow items-center">
        <section className="w-full py-20 text-center md:py-32">
          <div className="container">
            <h2 className="font-headline text-4xl font-bold tracking-tight md:text-6xl">
              Organize Your Life, One Task at a Time
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              TaskFlow is a simple and powerful tool to manage your daily tasks,
              create checklists, and stay productive.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto p-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
