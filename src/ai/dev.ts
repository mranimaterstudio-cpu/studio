import { config } from 'dotenv';
config();

import '@/ai/flows/generate-prompt-suggestions.ts';
import '@/ai/flows/summarize-chatbot-conversation.ts';
import '@/ai/flows/analyze-image.ts';
import '@/ai/flows/generate-visual-explanation.ts';
import '@/ai/flows/chat.ts';
import '@/ai/flows/generate-video-explanation.ts';
