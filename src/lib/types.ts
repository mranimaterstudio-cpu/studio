import {z} from 'zod';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const PersonalitySchema = z.enum(['general', 'creative', 'technical', 'sarcastic']);
export type Personality = z.infer<typeof PersonalitySchema>;


export const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  personality: PersonalitySchema,
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  content: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export type ChatExperiment = {
  id: string;
  type: 'chat';
  timestamp: number;
  personality: Personality;
  messages: Message[];
  summary?: string;
};

export type ImageModel = 'dall-e-3' | 'stable-diffusion-3' | 'imagen-2';

export type ImageExperiment = {
  id:string;
  type: 'image';
  timestamp: number;
  prompt: string;
  model: ImageModel;
  imageUrl: string;
};

export type Experiment = ChatExperiment | ImageExperiment;
