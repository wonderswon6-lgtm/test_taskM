'use server';

/**
 * @fileOverview A flow for generating a background image.
 *
 * - generateBackground - A function that generates an image.
 * - GenerateBackgroundInput - The input type for the generateBackground function.
 * - GenerateBackgroundOutput - The return type for the generateBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBackgroundInputSchema = z.object({
  prompt: z.string().describe('The prompt for image generation.'),
});
export type GenerateBackgroundInput = z.infer<typeof GenerateBackgroundInputSchema>;

const GenerateBackgroundOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateBackgroundOutput = z.infer<typeof GenerateBackgroundOutputSchema>;

export async function generateBackground(
  input: GenerateBackgroundInput
): Promise<GenerateBackgroundOutput> {
  return generateBackgroundFlow(input);
}

const generateBackgroundFlow = ai.defineFlow(
  {
    name: 'generateBackgroundFlow',
    inputSchema: GenerateBackgroundInputSchema,
    outputSchema: GenerateBackgroundOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: input.prompt,
    });
    return {
      imageUrl: media.url!,
    };
  }
);
