'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Experiment, ImageModel } from '@/lib/types';
import { generatePromptSuggestions } from '@/ai/flows/generate-prompt-suggestions';
import { Sparkles, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PromptInput, PromptInputWrapper } from '@/components/ui/prompt-input';

const placeholder = PlaceHolderImages.find(p => p.id === 'image-generation-placeholder')!;

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>('dall-e-3');
  const [imageUrl, setImageUrl] = useState<string>(placeholder.imageUrl);
  const [isGenerating, setIsGenerating] = useState(false);
  const [experiments, setExperiments] = useLocalStorage<Experiment[]>('experiments', []);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!prompt.trim()) {
       toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate an image.',
        variant: 'destructive',
      });
      return;
    };
    setIsGenerating(true);
    // Mock image generation
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
        description: 'Generate an image before saving the experiment.',
        variant: 'destructive',
      });
      return;
    }
    const newExperiment = {
      id: generateId(),
      type: 'image' as const,
      timestamp: Date.now(),
      prompt,
      model,
      imageUrl,
    };
    setExperiments([...experiments, newExperiment]);
    toast({
      title: 'Experiment Saved',
      description: 'Your image experiment has been saved to your history.',
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
          <CardTitle className="font-headline">Image Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handlePromptSubmit} className="space-y-4" suppressHydrationWarning>
             <div className="space-y-2">
                <label htmlFor="prompt-input" className="font-medium">Prompt</label>
                 <div className="flex items-center gap-2">
                   <Button onClick={handleGenerateSuggestions} variant="ghost" size="icon" disabled={isSuggestionsLoading} className="h-12 w-12 flex-shrink-0">
                    {isSuggestionsLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-primary h-6 w-6" />}
                  </Button>
                  <PromptInputWrapper className="w-full">
                    <PromptInput
                      id="prompt-input"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A cat in a space suit, digital art"
                    />
                  </PromptInputWrapper>
                </div>
              </div>
               <div className="flex flex-wrap gap-2 pl-14">
                {suggestions.map((s, i) => (
                  <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setPrompt(s)}>{s}</Badge>
                ))}
              </div>
          </form>

          <div className="space-y-2" suppressHydrationWarning>
            <label htmlFor="model-select" className="font-medium">Model</label>
            <Select value={model} onValueChange={(v) => setModel(v as ImageModel)}>
              <SelectTrigger id="model-select" className="w-full">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                <SelectItem value="stable-diffusion-3">Stable Diffusion 3</SelectItem>
                <SelectItem value="imagen-2">Imagen 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2" suppressHydrationWarning>
          <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1 shadow-md shadow-primary/30">
            {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : null}
            Generate
          </Button>
          <Button onClick={handleSaveExperiment} variant="outline">
            <Save className="mr-2" />
            Save
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline">Result</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center aspect-square relative">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <p>Generating your masterpiece...</p>
              </div>
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt={prompt || "AI generated image"}
                width={512}
                height={512}
                className="rounded-lg object-cover"
                data-ai-hint={imageUrl === placeholder.imageUrl ? placeholder.imageHint : prompt.split(" ").slice(0, 2).join(" ")}
              />
            ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <ImageIcon className="w-16 h-16" />
                    <p>Your generated image will appear here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
