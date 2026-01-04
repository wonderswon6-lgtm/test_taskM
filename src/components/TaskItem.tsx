'use client';

import type { Task } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';

type TaskItemProps = {
  task: Task;
  level: number;
  isSelected: boolean;
  onSelect: () => void;
  toggleComplete: (taskId: string) => void;
  updateTaskText: (taskId: string, newText: string) => void;
  deleteTask: (taskId: string) => void;
  addSubtask: (parentId: string, text: string) => void; // still here for sub-tasks within details view
};

export function TaskItem({
  task,
  level,
  isSelected,
  onSelect,
  toggleComplete,
  updateTaskText,
  deleteTask,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  // When task text changes from outside, update the edit text
  useEffect(() => {
    setEditText(task.text);
  }, [task.text])

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      updateTaskText(task.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    // Prevent label click from toggling checkbox
    e.preventDefault();
    if (!isEditing) {
      onSelect();
    }
  };


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col rounded-md"
    >
      <div
        onClick={handleLabelClick}
        className={cn(
          'group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-secondary cursor-pointer',
           isSelected && level === 0 ? 'bg-secondary ring-2 ring-primary' : '',
        )}
        style={{ paddingLeft: `${level * 2 + 0.5}rem` }}
      >
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={(e) => {
            e.stopPropagation();
            toggleComplete(task.id);
          }}
          onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to the div
          aria-label={`Mark task ${task.text} as ${
            task.completed ? 'incomplete' : 'complete'
          }`}
        />
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-8 flex-grow"
          />
        ) : (
           <span
            className={cn(
              'flex-grow text-sm',
              task.completed && 'text-muted-foreground line-through'
            )}
          >
            {task.text}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => deleteTask(task.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
       {/* Subtasks are now rendered in the detail view for top-level tasks */}
       {level > 0 && task.subtasks && task.subtasks.length > 0 && (
         <div className="flex flex-col">
            <AnimatePresence>
              {task.subtasks.map((subtask) => (
                <TaskItem
                    key={subtask.id}
                    task={subtask}
                    level={level + 1}
                    toggleComplete={toggleComplete}
                    updateTaskText={updateTaskText}
                    deleteTask={deleteTask}
                    addSubtask={addSubtask}
                    isSelected={false}
                    onSelect={() => {}}
                />
                ))}
            </AnimatePresence>
         </div>
       )}
    </motion.div>
  );
}
