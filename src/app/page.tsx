'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight, CheckCircle2, BrainCircuit, BellRing, ListTree } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: <ListTree className="h-10 w-10 text-primary" />,
    title: 'Organize with Ease',
    description: 'Create nested subtasks to break down complex projects into manageable steps. Stay on top of your workflow and never miss a detail.',
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Suggestions',
    description: "Leverage the power of AI to get smart suggestions for related tasks. Let TaskFlow help you think ahead and cover all your bases.",
  },
  {
    icon: <BellRing className="h-10 w-10 text-primary" />,
    title: 'Never Miss a Deadline',
    description: 'Set due dates and reminders for your tasks. TaskFlow will notify you, so you can focus on what’s important without worrying about deadlines.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="container mx-auto flex items-center justify-between p-4 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <h1 className="font-headline text-2xl font-bold text-primary">
          TaskFlow
        </h1>
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow">
        <section className="w-full py-20 text-center md:py-32">
          <div className="container">
            <h2 className="font-headline text-5xl font-bold tracking-tight md:text-7xl">
              Organize Your Life, One Task at a Time
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              TaskFlow is a simple and powerful tool to manage your daily tasks,
              create checklists, and stay productive with AI-powered assistance.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full bg-secondary/50 py-20 md:py-24">
            <div className="container">
                <div className="mx-auto max-w-4xl text-center">
                    <h3 className="text-4xl font-bold">Everything you need to stay organized</h3>
                    <p className="mt-4 text-lg text-muted-foreground">
                        TaskFlow is packed with features to help you be more productive and less stressed.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                            {feature.icon}
                            <h4 className="mt-6 text-2xl font-bold">{feature.title}</h4>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-20 md:py-32">
            <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className='pr-8'>
                    <Image 
                        src="https://picsum.photos/seed/app-showcase/1200/800" 
                        alt="TaskFlow App Screenshot"
                        width={1200}
                        height={800}
                        data-ai-hint="app screenshot"
                        className="rounded-xl shadow-2xl"
                    />
                </div>
                <div>
                    <h3 className="text-4xl font-bold">A beautiful, intuitive interface</h3>
                    <p className="mt-4 text-lg text-muted-foreground">
                        TaskFlow's clean design helps you focus on your tasks without distractions. Available in both light and dark mode.
                    </p>
                     <ul className="mt-6 space-y-4 text-lg">
                        <li className="flex items-start">
                            <CheckCircle2 className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                            <span>Create unlimited lists and tasks to organize every aspect of your life.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle2 className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                            <span>Visually track your progress with our clean and simple progress indicators.</span>
                        </li>
                         <li className="flex items-start">
                            <CheckCircle2 className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                            <span>Responsive design that works beautifully on desktop and mobile.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <section className="w-full py-20 text-center bg-primary text-primary-foreground">
          <div className="container">
            <h2 className="font-headline text-4xl font-bold tracking-tight">
              Ready to Boost Your Productivity?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg">
              Sign up today and start managing your tasks the smart way. It's free to get started!
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">Sign Up Now</Link>
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
