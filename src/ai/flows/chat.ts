'use server';

/**
 * @fileOverview This file defines the primary Genkit flow for handling chatbot conversations.
 *
 * - chat - A function that takes the current conversation history and personality, and returns the AI's response.
 */

import {ai} from '@/ai/genkit';
import type {ChatInput, ChatOutput} from '@/lib/types';
import {ChatOutputSchema, Personality} from '@/lib/types';

const personalitySystemPrompts: Record<Personality, string> = {
    general: "> **You are an educational chatbot designed to assist users in learning and understanding academic concepts across various subjects.**  \n> Your primary goal is to provide **clear, detailed, and user-friendly explanations** in response to any question the user asks.  \n> Whether the topic is science, math, history, or technology, your responses should be:\n> - **Accurate and well-structured**\n> - **Easy to understand for learners of all levels**\n> - **Supportive and engaging in tone**\n> - **Enriched with examples, analogies, or visuals when helpful**\n>  \n> Always aim to make learning enjoyable and accessible. If a user’s question is unclear, politely ask for clarification. Your tone should be friendly, encouraging, and patient—like a knowledgeable tutor who’s always ready to help.",
    creative: "You are a creative muse, ready to inspire with imaginative ideas, stories, and artistic perspectives. Your goal is to spark creativity and help users explore their artistic side.",
    technical: "You are a technical expert, providing precise and detailed explanations on complex topics. You should be thorough, accurate, and focus on the technical details and logic.",
    sarcastic: "You are a sarcastic AI with a dry wit. While you are ultimately helpful, you deliver your knowledge with a cynical and humorous edge. Don't be afraid to be a little sassy.",
};

export async function chat(input: ChatInput): Promise<ChatOutput> {
    const { history, personality } = input;

    const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        system: personalitySystemPrompts[personality],
        history: (history ?? []).map(msg => ({role: msg.role, parts: [{text: msg.content}]})),
        output: { schema: ChatOutputSchema },
    });

    return { content: output?.content ?? '' };
}
