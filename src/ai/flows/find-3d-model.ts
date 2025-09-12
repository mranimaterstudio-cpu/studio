'use server';
/**
 * @fileOverview A flow to find a 3D model from Sketchfab.
 *
 * - find3dModel - A function that handles finding a 3D model.
 */

import {z} from 'zod';

const SketchfabSearchResponseSchema = z.object({
  results: z.array(
    z.object({
      uid: z.string(),
    })
  ),
});

export async function find3dModel(
  promptText: string
): Promise<{modelUid: string | null}> {
  if (!process.env.SKETCHFAB_API_KEY) {
    throw new Error('Sketchfab API key is not configured.');
  }

  const searchParams = new URLSearchParams({
    type: 'models',
    q: promptText,
    downloadable: 'true',
  });

  try {
    const response = await fetch(
      `https://api.sketchfab.com/v3/search?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Token ${process.env.SKETCHFAB_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Sketchfab API error:', await response.text());
      throw new Error(`Sketchfab API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const validatedData = SketchfabSearchResponseSchema.safeParse(data);

    if (!validatedData.success) {
      console.error('Invalid data from Sketchfab API:', validatedData.error);
      return {modelUid: null};
    }

    const firstResult = validatedData.data.results[0];
    return {modelUid: firstResult ? firstResult.uid : null};
  } catch (error) {
    console.error('Error fetching from Sketchfab:', error);
    throw error;
  }
}
