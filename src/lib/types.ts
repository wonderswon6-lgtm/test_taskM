export type Task = {
  id: string;
  text: string;
  completed: boolean;
  subtasks: Task[];
  dueDate?: string;
};

export type TaskList = {
  id: string;
  name: string;
  icon: string; // This will now be an SVG string
  tasks: Task[];
  imageUrl: string;
  imageHint: string;
};
