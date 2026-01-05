'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { suggestRelatedTasks } from '@/ai/flows/suggest-related-tasks';
import type { Task } from '@/lib/types';
import { Wand2 } from 'lucide-react';

interface AIAssistantProps {
  listName: string;
  currentTasks: Task[];
  onAddTasks: (newTasks: string[]) => void;
}

export function AIAssistant({ listName, currentTasks, onAddTasks }: AIAssistantProps) {
  const [isGenerating, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGenerateSuggestions = () => {
    startTransition(async () => {
      try {
        const taskTexts = currentTasks.map((task) => task.text);
        const result = await suggestRelatedTasks({ listName, taskList: taskTexts });
        setSuggestions(result.suggestions);
      } catch (error) {
        console.error('Error generating suggestions:', error);
      }
    });
  };

  const handleAddSuggestion = (suggestion: string) => {
    onAddTasks([suggestion]);
    setSuggestions(suggestions.filter((s) => s !== suggestion));
  };

  return (
    <div className="mt-6">
      <Button onClick={handleGenerateSuggestions} disabled={isGenerating}>
        <Wand2 className="mr-2 h-4 w-4" />
        {isGenerating ? 'Thinking...' : 'Suggest Related Tasks'}
      </Button>

      {suggestions.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Suggested Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{suggestion}</span>
                  <Button size="sm" onClick={() => handleAddSuggestion(suggestion)}>
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
