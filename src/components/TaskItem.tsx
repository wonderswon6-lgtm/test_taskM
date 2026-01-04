'use client';

import type { Task } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MoreVertical, Trash2, Edit, CornerDownRight } from 'lucide-react';
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
  toggleComplete: (taskId: string) => void;
  updateTaskText: (taskId: string, newText: string) => void;
  deleteTask: (taskId: string) => void;
  addSubtask: (parentId: string, text: string) => void;
};

export function TaskItem({
  task,
  level,
  toggleComplete,
  updateTaskText,
  deleteTask,
  addSubtask,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (showSubtaskInput) {
      subtaskInputRef.current?.focus();
    }
  }, [showSubtaskInput]);

  useEffect(() => {
    setEditText(task.text);
  }, [task.text]);

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      updateTaskText(task.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newSubtaskText.trim()) {
      addSubtask(task.id, newSubtaskText.trim());
      setNewSubtaskText('');
      setShowSubtaskInput(false);
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
        className={cn(
          'group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-secondary'
        )}
        style={{ paddingLeft: `${level * 2 + 0.5}rem` }}
      >
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => toggleComplete(task.id)}
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
            className="h-8 flex-grow"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={cn(
              'flex-grow cursor-pointer text-sm',
              task.completed && 'text-muted-foreground line-through'
            )}
          >
            {task.text}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem onSelect={() => setShowSubtaskInput(true)}>
                <CornerDownRight className="mr-2 h-4 w-4" />
                <span>Add Subtask</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => deleteTask(task.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div style={{ paddingLeft: `${level * 2 + 0.5}rem` }}>
        {showSubtaskInput && (
           <motion.form 
            onSubmit={handleAddSubtask} 
            className="flex items-center gap-2 pt-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CornerDownRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <Input
              ref={subtaskInputRef}
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onBlur={() => {
                if (!newSubtaskText) setShowSubtaskInput(false);
              }}
              placeholder="Add a new sub-task..."
              className="h-9"
            />
            <Button type="submit" size="sm">
              Add
            </Button>
          </motion.form>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="flex flex-col pt-2">
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
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
