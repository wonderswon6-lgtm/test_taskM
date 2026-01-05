'use client';

import { useContext, useMemo, useEffect } from 'react';
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
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { TasksContext } from '@/context/TasksContext';
import { AddListDialog } from '@/components/AddListDialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
  const auth = useAuth();
  const router = useRouter();
  
  const user = auth?.user;
  const loading = auth?.loading;
  const logout = auth?.logout;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return nameParts[0][0] + nameParts[nameParts.length - 1][0];
    }
    return name.substring(0, 2);
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="container mx-auto p-4 py-8 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight">Lists</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Avatar>
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
            </Avatar>
            {logout && <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>}
          </div>
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
