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
  const [model, setModel] = useState<string>('model-1');
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
        <CardHeader>
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
                                placeholder="e.g., A detailed model of the solar system"
                            />
                        </PromptInputWrapper>
                    </div>
                     <div className="flex flex-wrap gap-2 px-14">
                        {suggestions.map((s, i) => (
                        <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => {setPrompt(s); handleGenerate();}}>{s}</Badge>
                        ))}
                    </div>
                </div>
            </form>
        </CardContent>
        <CardFooter className="flex gap-2" suppressHydrationWarning>
            <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1 shadow-md shadow-primary/30">
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Generate
            </Button>
            <Button onClick={handleSaveExperiment} variant="outline">
                <Save />
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
            ) : outputUrl ? (
              <Image
                src={outputUrl}
                alt={prompt || "AI generated 3D visual"}
                width={512}
                height={512}
                className="rounded-lg object-cover"
                data-ai-hint={outputUrl === placeholder.imageUrl ? placeholder.imageHint : prompt.split(" ").slice(0, 2).join(" ")}
              />
            ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Cuboid className="w-16 h-16" />
                    <p>Your generated 3D visual will appear here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
