'use server';

/**
 * @fileOverview Provides AI-powered suggestions for related tasks based on the current task list.
 *
 * - suggestRelatedTasks - A function that suggests related tasks.
 * - SuggestRelatedTasksInput - The input type for the suggestRelatedTasks function.
 * - SuggestRelatedTasksOutput - The return type for the suggestRelatedTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedTasksInputSchema = z.object({
  taskList: z
    .array(z.string())
    .describe('The current list of tasks for which to suggest related tasks.'),
});
export type SuggestRelatedTasksInput = z.infer<typeof SuggestRelatedTasksInputSchema>;

const SuggestRelatedTasksOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested tasks related to the current task list.'),
});
export type SuggestRelatedTasksOutput = z.infer<typeof SuggestRelatedTasksOutputSchema>;

export async function suggestRelatedTasks(
  input: SuggestRelatedTasksInput
): Promise<SuggestRelatedTasksOutput> {
  return suggestRelatedTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedTasksPrompt',
  input: {schema: SuggestRelatedTasksInputSchema},
  output: {schema: SuggestRelatedTasksOutputSchema},
  prompt: `You are a helpful task management assistant. Given the following list of tasks, suggest additional related tasks that would help the user comprehensively cover all aspects of their project.\n\nCurrent Tasks:\n{{#each taskList}}- {{this}}\n{{/each}}\n\nSuggested Tasks:\n`,
});

const suggestRelatedTasksFlow = ai.defineFlow(
  {
    name: 'suggestRelatedTasksFlow',
    inputSchema: SuggestRelatedTasksInputSchema,
    outputSchema: SuggestRelatedTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
