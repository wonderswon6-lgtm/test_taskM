export type SubTask = {
    id: string;
    text: string;
    completed: boolean;
};

export type Task = {
  id: string;
  listId: string;
  userId: string;
  text: string;
  completed: boolean;
  subtasks: SubTask[];
  dueDate?: string;
};

export type TaskList = {
  id: string;
  name: string;
  userId: string;
  icon: string; // This is an SVG string
};
