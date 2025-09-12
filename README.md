# AI Playground

This is a Next.js application built with Firebase Studio that serves as a user-friendly AI Experiment Playground.

## Core Features

- **Chatbot Interaction**: Engage in conversations with an AI chatbot for text generation.
- **Image Generation**: Generate images based on text prompts using AI image generation models.
- **Model/Personality Selection**: Choose from different AI models or 'personalities' to tailor the interaction.
- **Experiment Saving**: Save experiment inputs and AI outputs for later review using local browser storage.
- **Experiment History**: Review saved past experiments, with options to summarize chat conversations.
- **Prompt Suggestions**: Get AI-powered prompt suggestions for both chatbot and image generation.

## Getting Started

First, configure your API keys. Copy the `.env.template` file to a new file named `.env` and add your API keys.

```bash
cp .env.template .env
```

Then, open the `.env` file and add your secret keys.

Next, run the development server:

```bash
npm run dev
```

Then open [http://localhost:9002](http://localhost:9002) in your browser.
