'use server';
/**
 * @fileOverview A flow to generate a video from a text prompt using Veo.
 *
 * - generateVideo - A function that handles generating the video.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import { MediaPart } from 'genkit';

async function downloadVideoAsDataUrl(video: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set.');
    }
    const videoDownloadResponse = await fetch(
      `${video.media!.url}&key=${apiKey}`
    );
  
    if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
      throw new Error(`Failed to fetch video: ${videoDownloadResponse.statusText}`);
    }
  
    const buffer = await videoDownloadResponse.buffer();
    const base64 = buffer.toString('base64');
    return `data:video/mp4;base64,${base64}`;
}
  

export async function generateVideo(
    promptText: string
  ): Promise<{ videoUrl: string | null }> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.");
    }

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
  
      // Poll for completion
      while (!operation.done) {
        // Wait for 5 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 5000));
        operation = await ai.checkOperation(operation);
      }
  
      if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
      }
  
      const video = operation.output?.message?.content.find((p) => !!p.media);
      if (!video) {
        throw new Error('Failed to find the generated video');
      }

      const videoDataUrl = await downloadVideoAsDataUrl(video);
  
      return {
        videoUrl: videoDataUrl
      };

    } catch (error) {
      console.error('Error in generateVideo flow:', error);
      // Re-throw the error to be caught by the client
      if (error instanceof Error) {
        throw new Error(`Video generation failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during video generation.');
    }
}
