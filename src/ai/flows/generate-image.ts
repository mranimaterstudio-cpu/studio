'use server';
/**
 * @fileOverview A flow to generate a video from a text prompt.
 *
 * - generateVideo - A function that handles generating the video.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import * as fs from 'fs';
import { Readable } from 'stream';
import type { MediaPart } from 'genkit';


async function downloadVideo(video: MediaPart, path: string) {
  const fetch = (await import('node-fetch')).default;
  // Add API key before fetching the video.
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  const chunks: Buffer[] = [];
  for await (const chunk of videoDownloadResponse.body) {
    chunks.push(chunk as Buffer);
  }
  return `data:video/mp4;base64,${Buffer.concat(chunks).toString('base64')}`;
}


export async function generateVideo(
  promptText: string
): Promise<{ videoUrl: string | null }> {
  try {
    let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: promptText,
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
        operation = await ai.checkOperation(operation);
        // Sleep for 5 seconds before checking again.
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
    }
    
    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video) {
        throw new Error('Failed to find the generated video');
    }

    const videoUrl = await downloadVideo(video, 'output.mp4');

    return {
      videoUrl: videoUrl,
    };
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}
