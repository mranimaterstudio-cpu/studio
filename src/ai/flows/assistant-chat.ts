'use server';

/**
 * @fileOverview This file defines the Genkit flow for handling the AI assistant page.
 *
 * - assistantChat - A function that takes a prompt and returns the AI's response.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import type {ChatInput, ChatOutput} from '@/lib/types';
import {ChatOutputSchema} from '@/lib/types';


export async function assistantChat(prompt: string): Promise<ChatOutput> {
    const systemPrompt = `You are an intelligent study companion that helps users (students or educators) interactively analyze, understand, and explore any page of study material — such as textbooks, notes, or documents.
You accept typed or voice-based queries and provide accurate, detailed explanations, summaries, clarifications, or additional resources related to the content of the page.
If the user provides content, your answers should be based specifically on that content.
Provide step-by-step explanations when necessary (especially useful for formulas, derivations, or processes).
`;

    const response = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: prompt,
        output: { schema: ChatOutputSchema },
    });

    const content = response.text;

    return { content };
}
