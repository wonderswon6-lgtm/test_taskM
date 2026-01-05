'use client';

import {
  createContext,
  useCallback,
  ReactNode,
  useContext,
  useMemo,
  useEffect,
  useState,
  useRef,
} from 'react';
import type { TaskList as TaskListType, Task, SubTask } from '@/lib/types';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
    setDocumentNonBlocking,
    addDocumentNonBlocking,
    updateDocumentNonBlocking,
    deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';
import { generateListIcon, type GenerateListIconInput } from '@/ai/flows/generate-list-icon';

// This is a temporary type shim while we migrate fully to firestore.
// It allows us to merge firestore data with local data.
type CombinedTaskList = TaskListType & {
  tasks: Task[];
  imageUrl: string;
  imageHint: string;
};

interface TasksContextType {
  lists: CombinedTaskList[];
  allTasks: Task[];
  isLoading: boolean;
  addList: (name: string, icon: string) => void;
  deleteList: (listId: string) => Promise<void>;
  renameList: (listId: string, newName: string) => Promise<void>;
  addTask: (listId: string, text: string) => void;
  addSubtask: (listId: string, parentId: string, text: string) => void;
  toggleComplete: (listId: string, taskId: string) => void;
  updateTaskText: (listId: string, taskId: string, newText: string) => void;
  deleteTask: (listId: string, taskId: string) => void;
  setTaskDueDate: (listId: string, taskId: string, dueDate: string) => void;
}

export const TasksContext = createContext<TasksContextType>({
  lists: [],
  allTasks: [],
  isLoading: true,
  addList: () => {},
  deleteList: async () => {},
  renameList: async () => {},
  addTask: () => {},
  addSubtask: () => {},
  toggleComplete: () => {},
  updateTaskText: () => {},
  deleteTask: () => {},
  setTaskDueDate: () => {},
});

export const useTasks = () => useContext(TasksContext);

// A default, non-deletable list that shows all tasks.
const allTasksList: CombinedTaskList = {
  id: 'all',
  name: 'All Tasks',
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
  userId: '',
  tasks: [],
  imageUrl: `https://picsum.photos/seed/all/400/300`,
  imageHint: 'organized tasks',
};

const defaultCategories = ['Work', 'Home', 'Shopping', 'Music', 'Travel', 'Study', 'Art'];
const defaultIcons: { [key: string]: string } = {
    Work: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="12" x="5" y="6" rx="2"/><path d="M2 12h2.5"/><path d="M19.5 12H22"/><path d="M12 2v2.5"/><path d="M12 18v2.5"/></svg>',
    Home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    Shopping: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>',
    Music: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    Travel: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 1 4 4 1 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    Study: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    Art: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.01 3.24a5.13 5.13 0 1 0 7.25 7.25l-2.93 2.93c-.41.41-1.07.41-1.48 0l-5-5c-.41-.41-.41-1.07 0-1.48Z"/><path d="M12 11.5 6.5 17a1 1 0 1 0 1.41 1.41L13.5 13"/><path d="m5 6 3 3"/><path d="M14.8 2.22a5.13 5.13 0 1 0 7.25 7.25"/><path d="M4.6 18.4a5.13 5.13 0 1 0 7.25 7.25"/></svg>'
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  
  // Use a ref to ensure the default list creation only runs once per user session
  const defaultListsCreated = useRef(false);

  // Memoize the Firestore query for lists.
  const listsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, 'users', user.uid, 'lists')
        : null,
    [firestore, user]
  );
  const { data: listsData, isLoading: isLoadingLists } = useCollection<TaskListType>(listsQuery);

  // Memoize the Firestore query for tasks.
  const tasksQuery = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, 'users', user.uid, 'tasks')
        : null,
    [firestore, user]
  );
  const { data: tasksData, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);
  
  // Create default categories for new users
  useEffect(() => {
    // Conditions to run: user is loaded, not loading lists/tasks, it's the first time, and there's no data yet.
    if (user && !isLoadingLists && !isLoadingTasks && !defaultListsCreated.current && listsData?.length === 0 && tasksData?.length === 0) {
      defaultListsCreated.current = true; // Mark as run

      const createDefaultList = async (listName: string) => {
        try {
          const iconResult = await generateListIcon({ listName });
          const svgMatch = iconResult.svg.match(/<svg.*<\/svg>/s);
          const iconSvg = svgMatch ? svgMatch[0] : defaultIcons[listName] || allTasksList.icon;
          
          const newListId = uuidv4();
          const listDoc: TaskListType = {
            id: newListId,
            name: listName,
            icon: iconSvg,
            userId: user.uid,
          };
          const docRef = doc(firestore!, 'users', user.uid, 'lists', newListId);
          setDocumentNonBlocking(docRef, listDoc, { merge: true });
        } catch (error) {
          console.error(`Failed to create default list "${listName}":`, error);
          // Fallback for AI icon generation failure
          const newListId = uuidv4();
          const listDoc: TaskListType = {
            id: newListId,
            name: listName,
            icon: defaultIcons[listName] || allTasksList.icon,
            userId: user.uid,
          };
          const docRef = doc(firestore!, 'users', user.uid, 'lists', newListId);
          setDocumentNonBlocking(docRef, listDoc, { merge: true });
        }
      };

      defaultCategories.forEach(createDefaultList);
    }
  }, [user, isLoadingLists, isLoadingTasks, listsData, tasksData, firestore]);

  const addList = useCallback(
    (name: string, icon: string) => {
      if (!firestore || !user) return;
      const newListId = uuidv4();
      const listDoc: TaskListType = {
        id: newListId,
        name,
        icon,
        userId: user.uid,
      };
      const docRef = doc(firestore, 'users', user.uid, 'lists', newListId);
      setDocumentNonBlocking(docRef, listDoc, { merge: true });
    },
    [firestore, user]
  );

  const deleteList = useCallback(
    async (listId: string) => {
      if (!firestore || !user || listId === 'all') return;
      
      try {
        const userTasksCollection = collection(firestore, 'users', user.uid, 'tasks');
        const q = query(userTasksCollection, where("listId", "==", listId));
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map((taskDoc) =>
          deleteDoc(doc(firestore, 'users', user.uid, 'tasks', taskDoc.id))
        );

        await Promise.all(deletePromises);

        const listDocRef = doc(firestore, 'users', user.uid, 'lists', listId);
        await deleteDoc(listDocRef);

      } catch (error) {
          console.error("Error deleting list and its tasks:", error);
      }
    },
    [firestore, user]
  );

  const renameList = useCallback(async (listId: string, newName: string) => {
    if (!firestore || !user || !newName.trim()) return;

    const iconInput: GenerateListIconInput = { listName: newName.trim() };
    const result = await generateListIcon(iconInput);
    const svgMatch = result.svg.match(/<svg.*<\/svg>/s);
    const newIcon = svgMatch ? svgMatch[0] : '<svg />'; // Fallback icon

    const docRef = doc(firestore, 'users', user.uid, 'lists', listId);
    updateDocumentNonBlocking(docRef, { name: newName.trim(), icon: newIcon });
  }, [firestore, user]);

  const addTask = useCallback(
    (listId: string, text: string) => {
      if (!firestore || !user) return;
      
      const targetListId = listId === 'all' ? (listsData?.[0]?.id ?? 'default') : listId;

      const newTaskId = uuidv4();
      const newTask: Task = {
        id: newTaskId,
        text,
        completed: false,
        subtasks: [],
        listId: targetListId,
        userId: user.uid,
      };
      const docRef = doc(firestore, 'users', user.uid, 'tasks', newTaskId);
      setDocumentNonBlocking(docRef, newTask, { merge: true });
    },
    [firestore, user, listsData]
  );
  
  const findTask = (taskId: string) => tasksData?.find(t => t.id === taskId);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
      if (!firestore || !user) return;
      const docRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
      updateDocumentNonBlocking(docRef, updates);
  };
  
  const addSubtask = useCallback(
    (listId: string, parentId: string, text: string) => {
      const parentTask = findTask(parentId);
      if (!parentTask) return;

      const newSubtask: SubTask = {
        id: uuidv4(),
        text,
        completed: false,
      };

      const updatedSubtasks = [...(parentTask.subtasks || []), newSubtask];
      updateTask(parentId, { subtasks: updatedSubtasks });
    },
    [tasksData, firestore, user]
  );

  const toggleComplete = useCallback(
    (listId: string, taskId: string) => {
      const task = findTask(taskId);
      if (task) {
          updateTask(taskId, { completed: !task.completed });
      }
    },
    [tasksData, firestore, user]
  );

  const updateTaskText = useCallback(
    (listId: string, taskId: string, newText: string) => {
        const task = findTask(taskId);
        if (task) {
            updateTask(taskId, { text: newText });
        }
    },
    [tasksData, firestore, user]
  );

  const deleteTask = useCallback(
    (listId: string, taskId: string) => {
      if (!firestore || !user) return;
      const docRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
      deleteDocumentNonBlocking(docRef);
    },
    [firestore, user]
  );

  const setTaskDueDate = useCallback(
    (listId: string, taskId: string, dueDate: string) => {
        const task = findTask(taskId);
        if (task) {
            updateTask(taskId, { dueDate });
        }
    },
    [tasksData, firestore, user]
  );

  const processedLists = useMemo<CombinedTaskList[]>(() => {
    const tasksByList: { [key: string]: Task[] } = {};

    (tasksData || []).forEach(task => {
        if (!tasksByList[task.listId]) {
            tasksByList[task.listId] = [];
        }
        tasksByList[task.listId].push(task);
    });

    const combined = (listsData || []).map(list => ({
        ...list,
        tasks: tasksByList[list.id] || [],
        // These are placeholders for now, can be replaced with real data if needed
        imageUrl: `https://picsum.photos/seed/${list.name.toLowerCase()}/400/300`,
        imageHint: list.name.toLowerCase(),
    }));
    
    // Update the 'All' list with all tasks
    allTasksList.tasks = tasksData || [];

    return [allTasksList, ...combined];
  }, [listsData, tasksData]);
  
  const value = {
    lists: processedLists,
    allTasks: tasksData || [],
    isLoading: isUserLoading || isLoadingLists || isLoadingTasks,
    addList,
    deleteList,
    renameList,
    addTask,
    addSubtask,
    toggleComplete,
    updateTaskText,
    deleteTask,
    setTaskDueDate,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};
