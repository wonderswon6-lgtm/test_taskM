'use client';

import { useState, useMemo, useContext, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, CheckCircle, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TaskItem } from '@/components/TaskItem';
import Link from 'next/link';
import { TasksContext } from '@/context/TasksContext';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.listId as string;
  const { lists, ...taskHandlers } = useContext(TasksContext);
  const [newTaskText, setNewTaskText] = useState('');
  const auth = useAuth();
  const router = useRouter();

  const user = auth?.user;
  const loading = auth?.loading;
  
  const list = useMemo(() => lists.find((l) => l.id === listId), [lists, listId]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!list) {
    if (!loading) {
      return notFound();
    }
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const tasks = list.tasks;

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      taskHandlers.addTask(listId, newTaskText.trim());
      setNewTaskText('');
    }
  };

  const { totalTasks, completedTasks } = useMemo(() => {
    let total = 0;
    let completed = 0;
    const countTasks = (taskList: Task[]) => {
      taskList.forEach((task) => {
        total++;
        if (task.completed) completed++;
        if (task.subtasks.length > 0) {
          countTasks(task.subtasks);
        }
      });
    };
    countTasks(tasks);
    return { totalTasks: total, completedTasks: completed };
  }, [tasks]);

  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="container mx-auto p-4 py-8 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-5 w-5" />
              <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
                {list.name}
              </h1>
            </Link>
            <p className="mt-2 text-muted-foreground">
              {format(new Date(), "'Today is' eeee, MMMM do")}
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="mx-auto max-w-3xl">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">My Tasks</CardTitle>
              <CardDescription>
                You have {totalTasks - completedTasks} tasks left to complete.
                Keep it up!
              </CardDescription>
              <div className="pt-4">
                <Progress
                  value={progressPercentage}
                  aria-label={`${Math.round(
                    progressPercentage
                  )}% of tasks complete`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNewTask} className="mb-6 flex gap-2">
                <Input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="What's next on your list?"
                  aria-label="New task input"
                  className="text-base"
                />
                <Button type="submit" aria-label="Add new task">
                  <Plus className="h-5 w-5" />
                  <span className="hidden md:inline ml-2">Add Task</span>
                </Button>
              </form>
              <div className="space-y-2">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      level={0}
                      listId={listId}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border-2 border-dashed bg-secondary/30 py-16 text-center text-muted-foreground">
                    <CheckCircle className="mx-auto h-12 w-12 text-primary/50" />
                    <h3 className="mt-4 text-lg font-semibold">
                      All tasks completed!
                    </h3>
                    <p className="mt-1">
                      Ready to add something new to your list?
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
