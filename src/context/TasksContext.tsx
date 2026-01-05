'use client';

import {
  createContext,
  useCallback,
  ReactNode,
  useContext,
  useMemo,
  useEffect,
  useState
} from 'react';
import type { TaskList as TaskListType, Task, SubTask } from '@/lib/types';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore';
import {
    setDocumentNonBlocking,
    addDocumentNonBlocking,
    updateDocumentNonBlocking,
    deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';

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
  deleteList: (listId: string) => void;
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
  deleteList: () => {},
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

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [welcomeTasksCreated, setWelcomeTasksCreated] = useState(false);

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
  
  // Create some welcome tasks for new users
  useEffect(() => {
    if (user && !isLoadingLists && !isLoadingTasks && !welcomeTasksCreated && listsData?.length === 0 && tasksData?.length === 0) {
      const welcomeListId = uuidv4();
      const welcomeList: Omit<TaskListType, 'id'> = {
        name: 'Welcome!',
        userId: user.uid,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12M6 12l5-5M6 12l5 5"/></svg>'
      };

      const welcomeTasks: Omit<Task, 'id' | 'listId' | 'userId'>[] = [
        { text: 'This is a sample task', completed: false, subtasks: [] },
        { text: 'You can add more tasks', completed: false, subtasks: [] },
        { text: 'And create new lists!', completed: false, subtasks: [] }
      ];

      addDocumentNonBlocking(collection(firestore!, 'users', user.uid, 'lists'), { ...welcomeList, id: welcomeListId });

      welcomeTasks.forEach(task => {
        const taskId = uuidv4();
        addDocumentNonBlocking(collection(firestore!, 'users', user.uid, 'tasks'), { ...task, id: taskId, listId: welcomeListId, userId: user.uid });
      });

      setWelcomeTasksCreated(true);
    }
  }, [user, isLoadingLists, isLoadingTasks, listsData, tasksData, firestore, welcomeTasksCreated]);

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
      
      const docRef = doc(firestore, 'users', user.uid, 'lists', listId);
      deleteDocumentNonBlocking(docRef);

      // Also delete all tasks associated with this list
      const tasksInList = (tasksData || []).filter(t => t.listId === listId);
      for (const task of tasksInList) {
          const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
          deleteDocumentNonBlocking(taskDocRef);
      }
    },
    [firestore, user, tasksData]
  );

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
