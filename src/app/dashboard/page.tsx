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
  const Icon = iconMap[list.icon];
  const incompleteTasks = useMemo(() => countIncompleteTasks(list.tasks), [list.tasks]);

  return (
    <Link href={`/dashboard/list/${list.id}`}>
      <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
        {Icon && <Icon className="mb-6 h-8 w-8 text-primary" />}
        <h3 className="text-xl font-bold">{list.name}</h3>
        <p className="text-sm text-muted-foreground">{incompleteTasks} Tasks</p>
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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
