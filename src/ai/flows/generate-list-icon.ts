'use server';

/**
 * @fileOverview Provides an AI-powered flow to generate a vector icon for a task list.
 *
 * - generateListIcon - A function that generates an SVG icon based on a list name.
 * - GenerateListIconInput - The input type for the generateListIcon function.
 * - GenerateListIconOutput - The return type for the generateListIcon function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateListIconInputSchema = z.object({
  listName: z.string().describe('The name of the task list for which to generate an icon.'),
});
export type GenerateListIconInput = z.infer<typeof GenerateListIconInputSchema>;

const GenerateListIconOutputSchema = z.object({
  svg: z.string().describe('The generated SVG icon as a string.'),
});
export type GenerateListIconOutput = z.infer<typeof GenerateListIconOutputSchema>;

export async function generateListIcon(
  input: GenerateListIconInput
): Promise<GenerateListIconOutput> {
  return generateListIconFlow(input);
}

const prompt = ai.definePrompt(
  {
    name: 'generateListIconPrompt',
    input: { schema: GenerateListIconInputSchema },
    output: { schema: GenerateListIconOutputSchema },
    prompt: `You are a minimalist graphic designer. Your task is to create a simple, modern, single-color vector icon that represents the concept of "{{listName}}".

The output must be a valid SVG string. The SVG should be clean, scalable, and use 'currentColor' for the fill color so it can adapt to the theme. Do not include any width or height attributes on the <svg> tag itself. Ensure the viewBox is set appropriately, for example, "0 0 24 24".`,
  },
);

const generateListIconFlow = ai.defineFlow(
  {
    name: 'generateListIconFlow',
    inputSchema: GenerateListIconInputSchema,
    outputSchema: GenerateListIconOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
