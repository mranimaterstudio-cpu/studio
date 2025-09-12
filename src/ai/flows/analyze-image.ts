'use server';
/**
 * @fileOverview An AI agent for analyzing images, specifically for plant identification and health diagnosis.
 *
 * - analyzeImage - A function that handles the image analysis process.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of something to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of what the user wants to know about the image.'),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the input is a plant.'),
    commonName: z.string().describe('The name of the identified plant. If not a plant, this should be a general identification of the object.'),
    latinName: z.string().describe('The Latin name of the identified plant. If not a plant, this can be empty.'),
  }),
  diagnosis: z.object({
    isHealthy: z.boolean().describe('Whether or not the plant is healthy. If not a plant, this should be true.'),
    diagnosis: z.string().describe("A diagnosis of the plant's health or a general description if not a plant."),
  }),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {schema: AnalyzeImageInputSchema},
  output: {schema: AnalyzeImageOutputSchema},
  prompt: `You are an expert botanist specializing in identifying plants and diagnosing their illnesses. If the image is not a plant, identify what it is.

You will use this information to identify the object in the photo. 

If it is a plant, identify it and diagnose any issues it has. You will make a determination as to whether the plant is healthy or not, and what is wrong with it, and set the isHealthy output field appropriately.

If it is not a plant, set isPlant to false, provide a general identification, and set isHealthy to true with a simple description.

Use the following as the primary source of information.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
