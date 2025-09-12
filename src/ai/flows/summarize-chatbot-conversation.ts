'use server';

/**
 * @fileOverview Summarizes a chatbot conversation to quickly understand the main points.
 *
 * - summarizeChatbotConversation - A function that handles the summarization process.
 * - SummarizeChatbotConversationInput - The input type for the summarizeChatbotConversation function.
 * - SummarizeChatbotConversationOutput - The return type for the summarizeChatbotConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeChatbotConversationInputSchema = z.object({
  conversationText: z
    .string()
    .describe('The complete text of the chatbot conversation to summarize.'),
});
export type SummarizeChatbotConversationInput = z.infer<
  typeof SummarizeChatbotConversationInputSchema
>;

const SummarizeChatbotConversationOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the chatbot conversation.'),
});
export type SummarizeChatbotConversationOutput = z.infer<
  typeof SummarizeChatbotConversationOutputSchema
>;

export async function summarizeChatbotConversation(
  input: SummarizeChatbotConversationInput
): Promise<SummarizeChatbotConversationOutput> {
  return summarizeChatbotConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChatbotConversationPrompt',
  input: {schema: SummarizeChatbotConversationInputSchema},
  output: {schema: SummarizeChatbotConversationOutputSchema},
  prompt: `Summarize the following chatbot conversation. Focus on extracting the key information and main topics discussed. The summary should be concise and easy to understand.

Conversation:
{{{conversationText}}}`,
});

const summarizeChatbotConversationFlow = ai.defineFlow(
  {
    name: 'summarizeChatbotConversationFlow',
    inputSchema: SummarizeChatbotConversationInputSchema,
    outputSchema: SummarizeChatbotConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
