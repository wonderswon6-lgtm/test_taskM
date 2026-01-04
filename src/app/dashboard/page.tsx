'use client';

import { useState } from 'react';
import type { TaskList } from '@/lib/types';
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

const initialTaskLists: TaskList[] = [
  {
    id: '1',
    name: 'All',
    icon: 'List',
    taskCount: 23,
    tasks: [],
  },
  {
    id: '2',
    name: 'Work',
    icon: 'Briefcase',
    taskCount: 14,
    tasks: [],
  },
  {
    id: '3',
    name: 'Music',
    icon: 'Music',
    taskCount: 6,
    tasks: [],
  },
  {
    id: '4',
    name: 'Travel',
    icon: 'Plane',
    taskCount: 1,
    tasks: [],
  },
  {
    id: '5',
    name: 'Study',
    icon: 'BookOpen',
    taskCount: 2,
    tasks: [],
  },
  {
    id: '6',
    name: 'Home',
    icon: 'Home',
    taskCount: 14,
    tasks: [],
  },
  {
    id: '7',
    name: 'Art',
    icon: 'Palette',
    taskCount: 0,
    tasks: [],
  },
  {
    id: '8',
    name: 'Shopping',
    icon: 'ShoppingCart',
    taskCount: 0,
    tasks: [],
  },
];

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

function TaskListCard({ list }: { list: TaskList }) {
  const Icon = iconMap[list.icon];
  return (
    <Link href={`/dashboard/list/${list.id}`}>
      <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
        {Icon && <Icon className="mb-6 h-8 w-8 text-primary" />}
        <h3 className="text-xl font-bold">{list.name}</h3>
        <p className="text-sm text-muted-foreground">{list.taskCount} Tasks</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [taskLists, setTaskLists] = useState(initialTaskLists);

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
          {taskLists.map((list) => (
            <TaskListCard key={list.id} list={list} />
          ))}
        </div>
      </main>
      <button className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add new list</span>
      </button>
    </div>
  );
}
