'use client';

import { useState, useContext, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Home,
  List,
  Music,
  Palette,
  Plane,
  BookOpen,
  ShoppingCart,
  Plus,
  BrainCircuit,
  Loader2,
} from 'lucide-react';
import { TasksContext } from '@/context/TasksContext';
import { TaskItem } from '@/components/TaskItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import Link from 'next/link';
import {
  suggestRelatedTasks,
  type SuggestRelatedTasksInput,
} from '@/ai/flows/suggest-related-tasks';
import { useToast } from '@/hooks/use-toast';

function SvgIcon({ svg, className }: { svg: string, className?: string }) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}


function countTasks(
  tasks: Task[]
): { total: number; completed: number } {
  let total = 0;
  let completed = 0;
  tasks.forEach((task) => {
    total++;
    if (task.completed) {
      completed++;
    }
    if (task.subtasks) {
      const subtaskCounts = countTasks(task.subtasks);
      total += subtaskCounts.total;
      completed += subtaskCounts.completed;
    }
  });
  return { total, completed };
}

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.listId as string;

  const { lists, addTask } = useContext(TasksContext);
  const [newTaskText, setNewTaskText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const list = useMemo(() => lists.find((l) => l.id === listId), [lists, listId]);

  const { total: totalTasks, completed: completedTasks } = useMemo(() => {
    if (!list) return { total: 0, completed: 0 };
    return countTasks(list.tasks);
  }, [list]);

  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() && listId) {
      addTask(listId, newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleSuggestTasks = async () => {
    if (!list) return;
    setIsSuggesting(true);
    try {
      const currentTaskNames = list.tasks.map((t) => t.text);
      const input: SuggestRelatedTasksInput = { taskList: currentTaskNames };
      const result = await suggestRelatedTasks(input);

      result.suggestions.forEach((suggestion) => {
        addTask(listId, suggestion);
      });

      toast({
        title: 'Suggestions Added',
        description: `Added ${result.suggestions.length} new tasks to your list.`,
      });
    } catch (error) {
      console.error('Failed to suggest tasks:', error);
      toast({
        title: 'Suggestion Failed',
        description: 'Could not get AI-powered suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  if (!list) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">List not found</h2>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto max-w-4xl p-4 py-8 md:p-8">
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lists
          </Link>

          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/50'
              )}
            >
              <SvgIcon svg={list.icon} className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{list.name}</h1>
              <p className="text-muted-foreground">
                {completedTasks} of {totalTasks} tasks complete
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </header>

        <main>
          <form onSubmit={handleAddTask} className="mb-4 flex gap-2">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="h-11 text-base"
            />
            <Button type="submit" size="lg" className="h-11">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Add Task</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleSuggestTasks}
              disabled={isSuggesting}
              className="h-11"
            >
              {isSuggesting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-5 w-5" />
              )}
              Suggest
            </Button>
          </form>

          <Separator className="my-6" />

          <AnimatePresence>
            {list.tasks.map((task) => (
              <TaskItem key={task.id} task={task} level={0} listId={list.id} />
            ))}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
