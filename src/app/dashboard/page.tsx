'use client';

import { useContext, useMemo } from 'react';
import type { TaskList, Task } from '@/lib/types';
import {
  Briefcase,
  Home,
  List,
  Menu,
  Music,
  Palette,
  Plane,
  Plus,
  BookOpen,
  ShoppingCart,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { TasksContext } from '@/context/TasksContext';
import { AddListDialog } from '@/components/AddListDialog';
import { cn } from '@/lib/utils';

const iconMap: { [key: string]: React.ElementType } = {
  List,
  Briefcase,
  Music,
  Plane,
  BookOpen,
  Home,
  Palette,
  ShoppingCart,
};

function countIncompleteTasks(tasks: Task[]): number {
  let count = 0;
  tasks.forEach(task => {
    if (!task.completed) {
      count++;
    }
    if (task.subtasks) {
      count += countIncompleteTasks(task.subtasks);
    }
  });
  return count;
}


function TaskListCard({ list }: { list: TaskList }) {
  const incompleteTasks = useMemo(() => countIncompleteTasks(list.tasks), [list.tasks]);
  const Icon = iconMap[list.icon] || List;

  return (
    <Link href={`/dashboard/list/${list.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-1 flex flex-col h-full">
        <div className={cn(
            "flex h-32 w-full items-center justify-center bg-secondary/30",
            "group-hover:bg-secondary/50 transition-colors"
          )}>
            <Icon className="h-12 w-12 text-primary opacity-80 transition-transform group-hover:scale-110" />
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">{list.name}</h3>
              <p className="text-sm text-muted-foreground">{incompleteTasks} {incompleteTasks === 1 ? 'Task' : 'Tasks'}</p>
            </div>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { lists } = useContext(TasksContext);

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="container mx-auto p-4 py-8 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-foreground">
              <Menu className="h-7 w-7" />
            </button>
            <h1 className="text-4xl font-bold tracking-tight">Lists</h1>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {lists.map((list) => (
            <TaskListCard key={list.id} list={list} />
          ))}
        </div>
      </main>
      <AddListDialog>
        <button className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
          <Plus className="h-8 w-8" />
          <span className="sr-only">Add new list</span>
        </button>
      </AddListDialog>
    </div>
  );
}
