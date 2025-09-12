'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Experiment } from '@/lib/types';
import { generatePromptSuggestions } from '@/ai/flows/generate-prompt-suggestions';
import { Sparkles, Save, Loader2, Cuboid } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PromptInput, PromptInputWrapper, PromptInputWithIcons } from '@/components/ui/prompt-input';

const placeholder = PlaceHolderImages.find(p => p.id === 'image-generation-placeholder')!;

export default function ThreeDVisualExplanationPage() {
  const [prompt, setPrompt] = useState('');
  const [outputUrl, setOutputUrl] = useState<string>(placeholder.imageUrl);
  const [isGenerating, setIsGenerating] = useState(false);
  const [experiments, setExperiments] = useLocalStorage<Experiment[]>('experiments', []);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!prompt.trim()) {
       toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate a 3D explanation.',
        variant: 'destructive',
      });
      return;
    };
    setIsGenerating(true);
    // Mock generation
    setTimeout(() => {
      const seed = encodeURIComponent(prompt.slice(0, 50));
      setOutputUrl(`https://picsum.photos/seed/${seed}/512/512`);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSaveExperiment = () => {
    if (outputUrl === placeholder.imageUrl) {
       toast({
        title: 'Cannot save',
        description: 'Generate a visual before saving the experiment.',
        variant: 'destructive',
      });
      return;
    }
    // Note: This would need a new experiment type in a real scenario
    console.log("Saving experiment...");
    toast({
      title: 'Experiment Saved',
      description: 'Your 3D explanation has been saved to your history.',
    });
  };

  const handleGenerateSuggestions = async () => {
    setIsSuggestionsLoading(true);
    setSuggestions([]);
    try {
      // Re-using chatbot suggestions for now
      const response = await generatePromptSuggestions({ feature: 'chatbot', topic: prompt });
      setSuggestions(response.suggestions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate prompt suggestions.',
        variant: 'destructive',
      });
    }
    setIsSuggestionsLoading(false);
  };
  
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="bg-card/50">
      </Card>
    </div>
  );
}
