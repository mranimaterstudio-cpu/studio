'use server';
/**
 * @fileOverview A flow to generate a visual explanation video from a text prompt.
 *
 * - generateVisualExplanation - A function that handles the video generation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {Readable} from 'stream';

export async function generateVisualExplanation(
  promptText: string
): Promise<{videoUrl: string | null}> {
  return generateVisualExplanationFlow(promptText);
}

async function convertVideoToBase64(videoUrl: string): Promise<string> {
  const fetch = (await import('node-fetch')).default;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const response = await fetch(`${videoUrl}&key=${apiKey}`);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of response.body) {
    chunks.push(chunk as Buffer);
  }
  const videoBuffer = Buffer.concat(chunks);
  return `data:video/mp4;base64,${videoBuffer.toString('base64')}`;
}

const generateVisualExplanationFlow = ai.defineFlow(
  {
    name: 'generateVisualExplanationFlow',
    inputSchema: z.string(),
    outputSchema: z.object({videoUrl: z.string().nullable()}),
  },
  async prompt => {
    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: `Create a short, clear, and concise visual explanation of the following concept: ${prompt}`,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      throw new Error(
        `Failed to generate video: ${operation.error.code} ${operation.error.message}`
      );
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video || !video.media?.url) {
      return {videoUrl: null};
    }

    const dataUri = await convertVideoToBase64(video.media.url);
    return {videoUrl: dataUri};
  }
);
