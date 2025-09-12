'use server';
/**
 * @fileOverview A flow to generate an image from a text prompt.
 *
 * - generateImage - A function that handles generating the image.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

export async function generateImage(
  promptText: string
): Promise<{ imageUrl: string | null }> {
  try {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: promptText,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    return {
      imageUrl: media.url || null,
    };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}
