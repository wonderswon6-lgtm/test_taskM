'use client';

import { useContext, useMemo, useEffect } from 'react';
import type { Task } from '@/lib/types';
import {
  Plus,
  LogOut,
  Trash2,
  Pencil,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTasks } from '@/context/TasksContext';
import { AddListDialog } from '@/components/AddListDialog';
import { EditListDialog } from '@/components/EditListDialog';
import { cn } from '@/lib/utils';
import { useAuth, type User } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// This is a temporary type shim while we migrate fully to firestore.
// It allows us to merge firestore data with local data.
import type { TaskList as TaskListType } from '@/lib/types';
type CombinedTaskList = TaskListType & {
  tasks: Task[];
  imageUrl: string;
  imageHint: string;
};

function SvgIcon({ svg, className }: { svg: string, className?: string }) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}

function countTasks(tasks: Task[]): { total: number, incomplete: number, completed: number } {
  let total = 0;
  let completed = 0;
  tasks.forEach(task => {
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
  return { total, incomplete: total - completed, completed };
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function TaskListCard({ list }: { list: CombinedTaskList }) {
  const { deleteList } = useTasks();
  const { incomplete: incompleteTasks } = useMemo(() => countTasks(list.tasks), [list.tasks]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteList(list.id);
  };

  return (
    <motion.div variants={cardVariants} className="h-full">
      <Link href={`/dashboard/list/${list.id}`} className="group block h-full">
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg flex flex-col h-full">
          {incompleteTasks > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2 z-10">
              {incompleteTasks}
            </Badge>
          )}

          {list.id !== 'all' && ( 
            <div className="absolute top-1 right-1 z-20 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <EditListDialog list={list}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground"
                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </EditListDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      "{list.name}" list and all of its tasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <div className={cn(
              "flex h-32 w-full items-center justify-center bg-secondary/30",
            )}>
              <SvgIcon svg={list.icon} className="h-12 w-12 text-primary opacity-80" />
          </div>
          <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold">{list.name}</h3>
                <p className="text-sm text-muted-foreground">{incompleteTasks} {incompleteTasks === 1 ? 'Task' : 'Tasks'}</p>
              </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { lists, isLoading } = useTasks();
  const auth = useAuth();
  const router = useRouter();
  
  const user = auth?.user;
  const authLoading = auth?.loading;
  const logout = auth?.logout;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  if (authLoading || isLoading || !user) {
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
            <Avatar>
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
            </Avatar>
            {logout && <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>}
          </div>
        </header>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {lists.map((list) => (
            <TaskListCard key={list.id} list={list} />
          ))}
        </motion.div>
      </main>
      <AddListDialog>
        <button className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 z-30">
          <Plus className="h-8 w-8" />
          <span className="sr-only">Add new list</span>
        </button>
      </AddListDialog>
    </div>
  );
}
