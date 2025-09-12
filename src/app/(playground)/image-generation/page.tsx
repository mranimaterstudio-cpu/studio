'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Save, Image as ImageIcon } from 'lucide-react';
import { generatePromptSuggestions } from '@/ai/flows/generate-prompt-suggestions';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { generateId } from '@/lib/utils';
import type { Experiment, ImageModel } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { PromptInput, PromptInputWrapper, PromptInputActions } from '@/components/ui/prompt-input';

const placeholder = PlaceHolderImages.find(p => p.id === 'image-generation-placeholder')!;

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>('dall-e-3');
  const [imageUrl, setImageUrl] = useState<string>(placeholder.imageUrl);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [experiments, setExperiments] = useLocalStorage<Experiment[]>('experiments', []);

  const { toast } = useToast();

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate an image.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    // Mock generation
    setTimeout(() => {
      const seed = encodeURIComponent(prompt.slice(0, 50));
      setImageUrl(`https://picsum.photos/seed/${seed}/512/512`);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSaveExperiment = () => {
    if (imageUrl === placeholder.imageUrl) {
        toast({
            title: 'Cannot save',
            description: 'There is no generated image to save.',
            variant: 'destructive',
        });
        return;
    }
    const newExperiment: Experiment = {
      id: generateId(),
      type: 'image',
      timestamp: Date.now(),
      prompt,
      model,
      imageUrl,
    };
    setExperiments([...experiments, newExperiment]);
    toast({
      title: 'Experiment Saved',
      description: 'Your image and prompt have been saved to your history.',
    });
  };

  const handleGenerateSuggestions = async () => {
    setIsSuggestionsLoading(true);
    setSuggestions([]);
    try {
      const response = await generatePromptSuggestions({ feature: 'imageGeneration', topic: prompt });
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
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><ImageIcon /> Image Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <form onSubmit={handlePromptSubmit} className="space-y-4" suppressHydrationWarning>
                 <div className="space-y-2">
                    <label htmlFor="prompt-input" className="font-medium">Prompt</label>
                     <div className="flex items-center gap-2">
                         <Button onClick={handleGenerateSuggestions} variant="ghost" size="icon" disabled={isSuggestionsLoading} className="h-12 w-12 shrink-0">
                            {isSuggestionsLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-primary h-6 w-6" />}
                        </Button>
                        <PromptInputWrapper className="w-full">
                            <PromptInput 
                                id="prompt-input"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A cat in a space suit, digital art"
                                disabled={isGenerating}
                            />
                        </PromptInputWrapper>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setPrompt(s)}>{s}</Badge>
                    ))}
                </div>

                <div className="space-y-2">
                    <label htmlFor="model-select" className="font-medium">Model</label>
                    <Select value={model} onValueChange={(v) => setModel(v as ImageModel)} disabled={isGenerating}>
                        <SelectTrigger id="model-select" className="w-[280px] shadow-sm shadow-primary/20">
                            <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                            <SelectItem value="stable-diffusion-3">Stable Diffusion 3</SelectItem>
                            <SelectItem value="imagen-2">Imagen 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex gap-2 pt-4" suppressHydrationWarning>
                    <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="flex-1 shadow-md shadow-primary/30">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        Generate
                    </Button>
                    <Button onClick={handleSaveExperiment} variant="outline">
                        <Save/>
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline">Result</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center aspect-square relative">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <p>Generating image...</p>
            </div>
            ) : (
            <Image 
                src={imageUrl} 
                alt={prompt || placeholder.imageHint} 
                fill 
                className="object-cover rounded-md"
                data-ai-hint={placeholder.imageHint}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
