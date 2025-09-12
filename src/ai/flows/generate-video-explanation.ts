'use server';
/**
 * @fileOverview A flow to generate a video explanation from a text prompt using Veo.
 *
 * - generateVideoExplanation - A function that handles generating the video.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function generateVideoExplanation(
  promptText: string
): Promise<{ videoUrl: string | null }> {
  try {
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: `You are an AI-powered educational chatbot with integrated video generation capabilities. 
               Generate a short, visually engaging video that explains the following concept: ${promptText}.
               Include animations, diagrams, or simulations to illustrate key points.
               Use a friendly and educational tone suitable for learners of all ages.
               Provide step-by-step narration or subtitles to guide the viewer through the explanation.
               Ensure the video is accessible, concise, and optimized for mobile and desktop viewing.`,
      config: {
        durationSeconds: 8,
        aspectRatio: '16:9',
        responseEncoding: 'dataUri',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      throw new Error(
        'Failed to generate video: ' + operation.error.message
      );
    }

    const videoPart = operation.output?.message?.content.find(
      (p) => !!p.media && p.media.contentType?.startsWith('video/')
    );

    if (!videoPart || !videoPart.media) {
      console.error('No video found in operation result:', operation);
      return { videoUrl: null };
    }
    
    return { videoUrl: videoPart.media.url };

  } catch (error) {
    console.error('Error generating video explanation:', error);
    throw error;
  }
}
