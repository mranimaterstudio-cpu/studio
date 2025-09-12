'use server';
/**
 * @fileOverview A flow to generate a visual explanation (image and text) from a prompt.
 *
 * - generateVisualExplanation - A function that handles generating both assets.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const VisualExplanationSchema = z.object({
  title: z.string().describe('A clear and concise title for the explanation.'),
  explanation: z
    .string()
    .describe(
      'A detailed, step-by-step explanation of the concept, suitable for a learner.'
    ),
  imagePrompt: z
    .string()
    .describe(
      'A descriptive prompt for an image generation model to create a relevant visual aid.'
    ),
});

type VisualExplanation = z.infer<typeof VisualExplanationSchema>;

async function generateImage(promptText: string): Promise<string | null> {
  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: promptText,
  });

  return media.url;
}

export async function generateVisualExplanation(
  promptText: string
): Promise<{ explanation: VisualExplanation, imageUrl: string | null }> {
  try {
    const { output: explanationOutput } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: `You are an AI-powered educational content creator. 
               Explain the following concept in a clear, step-by-step manner. 
               Also, create a descriptive prompt that can be used to generate a single, visually engaging image to accompany the explanation.
               Concept: ${promptText}`,
      output: { schema: VisualExplanationSchema },
    });

    if (!explanationOutput) {
      throw new Error('Failed to generate textual explanation.');
    }
    
    const imageUrl = await generateImage(explanationOutput.imagePrompt);

    return { 
        explanation: explanationOutput,
        imageUrl
    };

  } catch (error) {
    console.error('Error generating visual explanation:', error);
    throw error;
  }
}
