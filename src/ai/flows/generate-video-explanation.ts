'use server';
/**
 * @fileOverview A flow to generate a visual explanation from a text prompt.
 *
 * - generateVideoExplanation - A function that handles generating the visual explanation.
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

export async function generateVideoExplanation(
  promptText: string
): Promise<{ explanation: z.infer<typeof VisualExplanationSchema>, imageUrl: string | null }> {
  try {
    // Step 1: Generate the textual explanation and a prompt for the image
    const { output: explanationOutput } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: `You are an AI-powered educational content creator. 
               Explain the following concept in a clear, step-by-step manner. 
               Also, create a descriptive prompt that can be used to generate a single, visually engaging image (like a diagram or illustration) to accompany the explanation.
               Concept: ${promptText}`,
      output: { schema: VisualExplanationSchema },
    });

    if (!explanationOutput) {
      throw new Error('Failed to generate textual explanation.');
    }
    
    // Step 2: Generate the image using the prompt from Step 1
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: explanationOutput.imagePrompt,
    });


    return { 
        explanation: explanationOutput,
        imageUrl: media?.url ?? null
    };

  } catch (error) {
    console.error('Error generating visual explanation:', error);
    throw error;
  }
}
