'use client';

import { useState, useMemo } from 'react';
import type { Task } from '@/lib/types';
import { useTasks } from '@/hooks/use-tasks';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, CheckCircle, ListTodo, CornerDownRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TaskItem } from '@/components/TaskItem';
import { AIAssistant } from '@/components/AIAssistant';
import Link from 'next/link';

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

export default function DashboardPage() {
  const { tasks, ...taskHandlers } = useTasks(initialData);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[1]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      taskHandlers.addTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleAddNewSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskText.trim() && selectedTask) {
      taskHandlers.addSubtask(selectedTask.id, newSubtaskText.trim());
      setNewSubtaskText('');
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
    
  // Find the full task object from the tasks array using the selectedTask's ID
  const currentSelectedTask = useMemo(() => {
    if (!selectedTask) return null;
    const findTask = (taskList: Task[]): Task | null => {
        for (const task of taskList) {
            if (task.id === selectedTask.id) return task;
            if (task.subtasks) {
                const found = findTask(task.subtasks);
                if (found) return found;
            }
        }
        return null;
    };
    return findTask(tasks);
  }, [selectedTask, tasks]);


  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="container mx-auto p-4 py-8 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
                TaskFlow
              </h1>
            </Link>
            <p className="text-muted-foreground">
              {format(new Date(), "'Today is' eeee, MMMM do")}
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Task List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">My Tasks</CardTitle>
                <CardDescription>
                  You have {totalTasks - completedTasks} tasks left to
                  complete. Keep it up!
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
                        isSelected={selectedTask?.id === task.id}
                        onSelect={() => setSelectedTask(task)}
                        {...taskHandlers}
                        // Pass a no-op for addSubtask to TaskItem
                        addSubtask={() => {}}
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
              {tasks.length > 0 && (
                <CardFooter>
                  <AIAssistant
                    currentTasks={tasks}
                    onAddTasks={(newTasks) => {
                      newTasks.forEach((taskText) =>
                        taskHandlers.addTask(taskText)
                      );
                    }}
                  />
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Right Column: Task Details */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
                <CardDescription>
                  Select a task to see its subtasks and details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentSelectedTask ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{currentSelectedTask.text}</h3>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Sub-tasks</h4>
                      {currentSelectedTask.subtasks && currentSelectedTask.subtasks.length > 0 ? (
                        currentSelectedTask.subtasks.map((subtask) => (
                           <TaskItem
                            key={subtask.id}
                            task={subtask}
                            level={1}
                             isSelected={false}
                             onSelect={() => {
                                // Subtasks don't have their own detail view in this design
                             }}
                            {...taskHandlers}
                             // Pass a no-op for addSubtask to sub-TaskItems
                             addSubtask={() => {}}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No sub-tasks yet.</p>
                      )}
                    </div>
                     <form onSubmit={handleAddNewSubtask} className="flex items-center gap-2 pt-4">
                        <CornerDownRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <Input
                            value={newSubtaskText}
                            onChange={(e) => setNewSubtaskText(e.target.value)}
                            placeholder="Add a new sub-task..."
                            className="h-9"
                        />
                        <Button type="submit" size="sm">Add</Button>
                    </form>
                  </div>
                ) : (
                  <div className="py-16 text-center text-muted-foreground">
                    <ListTodo className="mx-auto h-12 w-12 text-primary/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Task Selected</h3>
                    <p className="mt-1">Click on a task from the list to see details.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
