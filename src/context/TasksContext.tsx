'use client';

import { createContext, useState, useCallback, ReactNode } from 'react';
import type { TaskList, Task } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImageData = (seed: string) => {
    const seedId = `list-${seed.toLowerCase()}`;
    const imageData = PlaceHolderImages.find((img) => img.id === seedId);
    return {
        imageUrl: imageData?.imageUrl || `https://picsum.photos/seed/${seed}/400/300`,
        imageHint: imageData?.imageHint || 'random image',
    }
}

const initialTaskLists: TaskList[] = [
    {
      id: '1',
      name: 'All',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
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
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
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
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      tasks: [],
      ...getImageData('music')
    },
    {
      id: '4',
      name: 'Travel',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
      tasks: [],
      ...getImageData('travel')
    },
    {
      id: '5',
      name: 'Study',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      tasks: [],
      ...getImageData('study')
    },
    {
      id: '6',
      name: 'Home',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      tasks: [],
      ...getImageData('home')
    },
    {
      id: '7',
      name: 'Art',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 1 0 10 10"/></svg>',
      tasks: [],
      ...getImageData('art')
    },
    {
      id: '8',
      name: 'Shopping',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>',
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
  setTaskDueDate: (listId: string, taskId: string, dueDate: string) => void;
}

export const TasksContext = createContext<TasksContextType>({
  lists: [],
  addList: () => {},
  addTask: () => {},
  addSubtask: () => {},
  toggleComplete: () => {},
  updateTaskText: () => {},
  deleteTask: () => {},
  setTaskDueDate: () => {},
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

  const setTaskDueDate = useCallback((listId: string, taskId: string, dueDate: string) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
        const newTasks = modifyTaskRecursive(list.tasks, taskId, (task) => ({
            ...task,
            dueDate,
        }));
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
    setTaskDueDate,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
