'use client';

import { createContext, useState, useCallback, ReactNode } from 'react';
import type { TaskList, Task } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImageData = (seed: string) => {
    const imageData = PlaceHolderImages.find((img) => img.id.includes(seed));
    return {
        imageUrl: imageData?.imageUrl || `https://picsum.photos/seed/${seed}/400/300`,
        imageHint: imageData?.imageHint || 'random image',
    }
}

const initialTaskLists: TaskList[] = [
    {
      id: '1',
      name: 'All',
      icon: 'List',
      tasks: [
        {
          id: '1-1',
          text: 'Design the main dashboard UI',
          completed: true,
          subtasks: [
            { id: '1-1-1', text: 'Create wireframes', completed: true, subtasks: [] },
            { id: '1-1-2', text: 'Develop mockups in Figma', completed: true, subtasks: [] },
          ],
        },
        {
          id: '1-2',
          text: 'Develop the main application features',
          completed: false,
          subtasks: [
            { id: '1-2-1', text: 'Implement task creation', completed: true, subtasks: [] },
          ],
        },
      ],
      ...getImageData('all')
    },
    {
      id: '2',
      name: 'Work',
      icon: 'Briefcase',
      tasks: [
          {
              id: '2-1',
              text: 'Finish Q3 report',
              completed: false,
              subtasks: [],
          }
      ],
      ...getImageData('work')
    },
    {
      id: '3',
      name: 'Music',
      icon: 'Music',
      tasks: [],
      ...getImageData('music')
    },
    {
      id: '4',
      name: 'Travel',
      icon: 'Plane',
      tasks: [],
      ...getImageData('travel')
    },
    {
      id: '5',
      name: 'Study',
      icon: 'BookOpen',
      tasks: [],
      ...getImageData('study')
    },
    {
      id: '6',
      name: 'Home',
      icon: 'Home',
      tasks: [],
      ...getImageData('home')
    },
    {
      id: '7',
      name: 'Art',
      icon: 'Palette',
      tasks: [],
      ...getImageData('art')
    },
    {
      id: '8',
      name: 'Shopping',
      icon: 'ShoppingCart',
      tasks: [],
      ...getImageData('shopping')
    },
  ];

interface TasksContextType {
  lists: TaskList[];
  addList: (name: string, icon: string) => void;
  addTask: (listId: string, text: string) => void;
  addSubtask: (listId: string, parentId: string, text: string) => void;
  toggleComplete: (listId: string, taskId: string) => void;
  updateTaskText: (listId: string, taskId: string, newText: string) => void;
  deleteTask: (listId: string, taskId: string) => void;
}

export const TasksContext = createContext<TasksContextType>({
  lists: [],
  addList: () => {},
  addTask: () => {},
  addSubtask: () => {},
  toggleComplete: () => {},
  updateTaskText: () => {},
  deleteTask: () => {},
});

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [lists, setLists] = useState<TaskList[]>(initialTaskLists);

  const addList = useCallback((name: string, icon: string) => {
    const newList: TaskList = {
      id: crypto.randomUUID(),
      name,
      icon,
      tasks: [],
      ...getImageData(name.toLowerCase())
    };
    setLists((prevLists) => [...prevLists, newList]);
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
  
  const updateListTasks = (listId: string, newTasks: Task[]) => {
    setLists(prevLists => prevLists.map(list => 
        list.id === listId ? {...list, tasks: newTasks} : list
    ));
  }

  const addTask = useCallback((listId: string, text: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      subtasks: [],
    };
    const list = lists.find(l => l.id === listId);
    if(list) {
        updateListTasks(listId, [...list.tasks, newTask]);
    }
  }, [lists]);

  const addSubtask = useCallback((listId: string, parentId: string, text: string) => {
    const newSubtask: Task = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        subtasks: [],
    };
    const list = lists.find(l => l.id === listId);
    if (list) {
        const newTasks = modifyTaskRecursive(list.tasks, parentId, (task) => ({
            ...task,
            subtasks: [...task.subtasks, newSubtask],
        }));
        updateListTasks(listId, newTasks);
    }
  }, [lists]);

  const toggleComplete = useCallback((listId: string, taskId: string) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
        const newTasks = modifyTaskRecursive(list.tasks, taskId, (task) => ({
            ...task,
            completed: !task.completed,
        }));
        updateListTasks(listId, newTasks);
    }
  }, [lists]);

  const updateTaskText = useCallback((listId: string, taskId: string, newText: string) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
        const newTasks = modifyTaskRecursive(list.tasks, taskId, (task) => ({
            ...task,
            text: newText,
        }));
        updateListTasks(listId, newTasks);
    }
  }, [lists]);
  
  const deleteTask = useCallback((listId: string, taskId: string) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
        const newTasks = modifyTaskRecursive(list.tasks, taskId, () => null);
        updateListTasks(listId, newTasks);
    }
  }, [lists]);

  const value = {
    lists,
    addList,
    addTask,
    addSubtask,
    toggleComplete,
    updateTaskText,
    deleteTask,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
