import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Edit, ListChecks, Plus, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="container mx-auto flex items-center justify-between p-4">
        <h1 className="font-headline text-2xl font-bold text-primary">
          TaskFlow
        </h1>
        <ThemeToggle />
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 text-center md:py-32">
          <div className="container">
            <h2 className="font-headline text-4xl font-bold tracking-tight md:text-6xl">
              Organize Your Life, One Task at a Time
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              TaskFlow is a simple and powerful tool to manage your daily tasks,
              create checklists, and stay productive.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-secondary/50 py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h3 className="font-headline text-3xl font-bold">
                Features to Help You Succeed
              </h3>
              <p className="mt-4 text-muted-foreground">
                Everything you need to keep your tasks in order.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-6 w-6" /> Add Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Quickly add new tasks to your list so you never forget what's
                  important.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-6 w-6" /> Checklists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Break down large tasks into manageable sub-tasks with
                  checklists.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-6 w-6" /> Edit & Delete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Easily modify or remove tasks as your priorities change.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-6 w-6" /> Stay Organized
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Mark tasks as complete and watch your productivity soar.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h3 className="font-headline text-3xl font-bold">How It Works</h3>
              <p className="mt-4 text-muted-foreground">
                Get organized in three simple steps.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h4 className="text-xl font-semibold">Write Tasks</h4>
                <p className="mt-2 text-muted-foreground">
                  Add all your to-dos for the day, week, or month.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h4 className="text-xl font-semibold">Check Them Off</h4>
                <p className="mt-2 text-muted-foreground">
                  Enjoy the satisfaction of completing your tasks.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h4 className="text-xl font-semibold">Manage Your Day</h4>
                <p className="mt-2 text-muted-foreground">
                  Stay on top of your work and personal life with ease.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary/50 py-20">
          <div className="container text-center">
            <h3 className="font-headline text-3xl font-bold">
              Ready to Get Started?
            </h3>
            <p className="mt-4 text-lg text-muted-foreground">
              Take control of your tasks and boost your productivity today.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/login">Go to Dashboard</Link>
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
