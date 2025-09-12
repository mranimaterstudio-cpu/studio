// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating prompt suggestions for both chatbot and image generation features.
 *
 * - generatePromptSuggestions - A function that generates prompt suggestions based on the provided input.
 * - GeneratePromptSuggestionsInput - The input type for the generatePromptSuggestions function.
 * - GeneratePromptSuggestionsOutput - The return type for the generatePromptSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromptSuggestionsInputSchema = z.object({
  feature: z.enum(['chatbot', 'imageGeneration']).describe('The feature for which to generate prompt suggestions.'),
  topic: z.string().optional().describe('An optional topic to generate prompts about.'),
});
export type GeneratePromptSuggestionsInput = z.infer<typeof GeneratePromptSuggestionsInputSchema>;

const GeneratePromptSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of prompt suggestions.'),
});
export type GeneratePromptSuggestionsOutput = z.infer<typeof GeneratePromptSuggestionsOutputSchema>;

export async function generatePromptSuggestions(input: GeneratePromptSuggestionsInput): Promise<GeneratePromptSuggestionsOutput> {
  return generatePromptSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromptSuggestionsPrompt',
  input: {schema: GeneratePromptSuggestionsInputSchema},
  output: {schema: GeneratePromptSuggestionsOutputSchema},
  prompt: `You are an AI prompt suggestion generator. Your role is to provide creative and effective prompt suggestions for users interacting with AI-powered applications.

  The user is looking for prompt suggestions for the "{{feature}}" feature.

  {{#if topic}}
  The user is interested in the topic: "{{topic}}".
  {{/if}}

  Generate 5 diverse and engaging prompt suggestions that the user can use.
  Each prompt suggestion should be clear, concise, and actionable. Avoid generic prompts; instead, focus on prompts that encourage exploration and creativity.
  Return the prompt suggestions as a JSON array of strings.
  Example:
  [
    "Write a short story about a cat who goes on an adventure.",
    "Generate an image of a futuristic cityscape at night.",
    "Suggest a healthy recipe using only five ingredients.",
    "Create a poem about the beauty of nature.",
    "Describe the feeling of being in love."
  ]
  `,
});

const generatePromptSuggestionsFlow = ai.defineFlow(
  {
    name: 'generatePromptSuggestionsFlow',
    inputSchema: GeneratePromptSuggestionsInputSchema,
    outputSchema: GeneratePromptSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
