'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { useTasks } from '@/hooks/use-tasks';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TaskItem } from '@/components/TaskItem';
import { AIAssistant } from '@/components/AIAssistant';

const initialData: Task[] = [
  {
    id: '1',
    text: 'Design the main dashboard UI',
    completed: true,
    subtasks: [
      { id: '1-1', text: 'Create wireframes', completed: true, subtasks: [] },
      { id: '1-2', text: 'Develop mockups in Figma', completed: true, subtasks: [] },
    ],
  },
  {
    id: '2',
    text: 'Develop the main application features',
    completed: false,
    subtasks: [
      { id: '2-1', text: 'Implement task creation', completed: true, subtasks: [] },
      { id: '2-2', text: 'Implement task editing and deletion', completed: false, subtasks: [] },
      { id: '2-3', text: 'Add subtask functionality', completed: false, subtasks: [] },
    ],
  },
  {
    id: '3',
    text: 'Prepare for launch',
    completed: false,
    subtasks: [],
  },
];

export default function Home() {
  const { tasks, ...taskHandlers } = useTasks(initialData);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      taskHandlers.addTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="container mx-auto max-w-4xl p-4 py-8 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            TaskFlow
          </h1>
          <ThemeToggle />
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <form onSubmit={handleAddNewTask} className="flex gap-2">
              <Input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new task..."
                aria-label="New task input"
                className="text-base"
              />
              <Button type="submit" aria-label="Add new task">
                <Plus className="h-5 w-5" />
              </Button>
            </form>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    level={0}
                    {...taskHandlers}
                  />
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  <p>Your task list is empty.</p>
                  <p>Add a new task to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <AIAssistant
              currentTasks={tasks}
              onAddTasks={(newTasks) => {
                newTasks.forEach((taskText) => taskHandlers.addTask(taskText));
              }}
            />
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
