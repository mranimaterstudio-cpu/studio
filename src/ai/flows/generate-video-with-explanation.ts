'use server';
/**
 * @fileOverview A flow to generate a video and a textual explanation from a prompt.
 *
 * - generateVideoWithExplanation - A function that handles generating both assets.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import type { MediaPart } from 'genkit';


async function downloadVideo(video: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
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

async function generateVideo(promptText: string): Promise<string | null> {
    let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: promptText,
        config: {
            durationSeconds: 5,
            aspectRatio: '16:9',
        },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation for video generation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
        operation = await ai.checkOperation(operation);
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) {
        throw new Error('Failed to generate video: ' + operation.error.message);
    }
    
    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video) {
        throw new Error('Failed to find the generated video');
    }

    return await downloadVideo(video);
}

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
      'A descriptive prompt for an image generation model to create a relevant visual aid. This will be used to generate a video.'
    ),
});

type VisualExplanation = z.infer<typeof VisualExplanationSchema>;


async function generateExplanation(promptText: string): Promise<VisualExplanation> {
     const { output: explanationOutput } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: `You are an AI-powered educational content creator. 
               Explain the following concept in a clear, step-by-step manner. 
               Also, create a descriptive prompt that can be used to generate a single, visually engaging video to accompany the explanation.
               Concept: ${promptText}`,
      output: { schema: VisualExplanationSchema },
    });

    if (!explanationOutput) {
      throw new Error('Failed to generate textual explanation.');
    }
    return explanationOutput;
}


export async function generateVideoWithExplanation(
  promptText: string
): Promise<{ explanation: VisualExplanation, videoUrl: string | null }> {
  try {
    
    const [explanation, videoUrl] = await Promise.all([
        generateExplanation(promptText),
        generateVideo(promptText) // Using original prompt for more direct video result
    ]);

    return { 
        explanation,
        videoUrl
    };

  } catch (error) {
    console.error('Error generating video explanation:', error);
    throw error;
  }
}
