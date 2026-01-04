'use client';

import { useState } from 'react';
import { Lightbulb, Loader2, Plus } from 'lucide-react';
import { suggestRelatedTasks } from '@/ai/flows/suggest-related-tasks';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import type { Task } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

interface AIAssistantProps {
  currentTasks: Task[];
  onAddTasks: (taskTexts: string[]) => void;
}

export function AIAssistant({ currentTasks, onAddTasks }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const getTaskTexts = (tasks: Task[]): string[] => {
    let texts: string[] = [];
    tasks.forEach((task) => {
      texts.push(task.text);
      if (task.subtasks && task.subtasks.length > 0) {
        texts = [...texts, ...getTaskTexts(task.subtasks)];
      }
    });
    return texts;
  };

  const handleSuggest = async () => {
    setLoading(true);
    setSuggestions([]);
    const taskList = getTaskTexts(currentTasks);

    if (taskList.length === 0) {
      toast({
        title: 'Cannot generate suggestions',
        description: 'Please add at least one task to get AI suggestions.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const result = await suggestRelatedTasks({ taskList });
      if (result && result.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        title: 'AI Suggestion Error',
        description:
          'There was a problem getting suggestions. Please try again later.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleAddTask = (taskText: string) => {
    onAddTasks([taskText]);
    setSuggestions((prev) => prev.filter((s) => s !== taskText));
  };

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <Button onClick={handleSuggest} disabled={loading} variant="ghost">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting suggestions...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Suggest Related Tasks
            </>
          )}
        </Button>
      </div>
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5" />
                  AI Suggestions
                </CardTitle>
                <CardDescription>
                  Here are some tasks you might want to add:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between gap-2 rounded-md bg-background p-2 shadow-sm"
                    >
                      <span className="text-sm">{suggestion}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddTask(suggestion)}
                        aria-label={`Add task: ${suggestion}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
