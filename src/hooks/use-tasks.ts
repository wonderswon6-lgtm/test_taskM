'use client';

import { useState, useCallback } from 'react';
import type { Task } from '@/lib/types';

export function useTasks(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = useCallback((text: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      subtasks: [],
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  }, []);

  const modifyTaskRecursive = (
    taskList: Task[],
    taskId: string,
    operation: (task: Task) => Task | null
  ): Task[] => {
    return taskList
      .map((task) => {
        if (task.id === taskId) {
          return operation(task);
        }
        if (task.subtasks.length > 0) {
          const newSubtasks = modifyTaskRecursive(
            task.subtasks,
            taskId,
            operation
          );
          if (newSubtasks !== task.subtasks) {
            return { ...task, subtasks: newSubtasks };
          }
        }
        return task;
      })
      .filter((task): task is Task => task !== null);
  };

  const toggleComplete = useCallback((taskId: string) => {
    setTasks((prevTasks) =>
      modifyTaskRecursive(prevTasks, taskId, (task) => ({
        ...task,
        completed: !task.completed,
      }))
    );
  }, []);

  const updateTaskText = useCallback((taskId: string, newText: string) => {
    setTasks((prevTasks) =>
      modifyTaskRecursive(prevTasks, taskId, (task) => ({
        ...task,
        text: newText,
      }))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prevTasks) => modifyTaskRecursive(prevTasks, taskId, () => null));
  }, []);

  const addSubtask = useCallback((parentId: string, text: string) => {
    const newSubtask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      subtasks: [],
    };
    setTasks((prevTasks) =>
      modifyTaskRecursive(prevTasks, parentId, (task) => ({
        ...task,
        subtasks: [...task.subtasks, newSubtask],
      }))
    );
  }, []);

  return {
    tasks,
    addTask,
    toggleComplete,
    updateTaskText,
    deleteTask,
    addSubtask,
  };
}
