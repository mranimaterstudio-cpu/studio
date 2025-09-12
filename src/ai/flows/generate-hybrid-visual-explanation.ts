'use server';
/**
 * @fileOverview A flow to generate a hybrid visual explanation.
 * It first attempts to find a 3D model on Sketchfab. If successful, it returns the model UID.
 * If not, it generates a 2D image.
 * In parallel, it generates a textual explanation for the query.
 *
 * - generateHybridVisualExplanation - A function that handles generating all assets.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import { find3dModel } from './find-3d-model';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const ExplanationSchema = z.object({
  title: z.string().describe('A clear and concise title for the explanation.'),
  explanation: z
    .string()
    .describe(
      'A detailed, step-by-step explanation of the concept, suitable for a learner.'
    ),
  imagePrompt: z
    .string()
    .describe(
      'A descriptive prompt for an image generation model to create a relevant visual aid. This is used if a 3D model is not found.'
    ),
});

export type Explanation = z.infer<typeof ExplanationSchema>;

export type HybridVisualExplanation = {
    explanation: Explanation;
    modelUid: string | null;
    imageUrl: string | null;
};

async function generateImage(promptText: string): Promise<string | null> {
  try {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: promptText,
    });
    return media.url;
  } catch (error) {
    console.error('Image generation failed, returning default.', error);
    return PlaceHolderImages.find(p => p.id === 'image-generation-placeholder')?.imageUrl || null;
  }
}

async function generateExplanation(promptText: string): Promise<Explanation> {
    const { output } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: `You are an AI-powered educational content creator. 
                 Explain the following concept in a clear, step-by-step manner. 
                 Also, create a descriptive prompt that can be used to generate a single, visually engaging image to accompany the explanation, which will be used if a 3D model is not found.
                 Concept: ${promptText}`,
        output: { schema: ExplanationSchema },
    });
    if (!output) {
      throw new Error('Failed to generate textual explanation.');
    }
    return output;
}


export async function generateHybridVisualExplanation(
  promptText: string
): Promise<HybridVisualExplanation> {
  try {
    // Run sketchfab search and text generation in parallel
    const [modelResult, explanation] = await Promise.all([
      find3dModel(promptText),
      generateExplanation(promptText)
    ]);
    
    let imageUrl: string | null = null;
    if (!modelResult.modelUid) {
        // If no 3D model, generate an image
        imageUrl = await generateImage(explanation.imagePrompt);
    }

    return {
      explanation,
      modelUid: modelResult.modelUid,
      imageUrl,
    };
  } catch (error) {
    console.error('Error generating hybrid visual explanation:', error);
    throw error;
  }
}
