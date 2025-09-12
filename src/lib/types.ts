export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type Personality = 'general' | 'creative' | 'technical' | 'sarcastic';

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
