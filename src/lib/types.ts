export type Task = {
  id: string;
  text: string;
  completed: boolean;
  subtasks: Task[];
};

export type TaskList = {
  id: string;
  name: string;
  icon: string;
  taskCount: number;
  tasks: Task[];
};
