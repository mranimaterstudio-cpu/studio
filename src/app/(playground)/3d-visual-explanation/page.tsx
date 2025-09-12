'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Cuboid, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PromptInput, PromptInputWrapper, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input';

const placeholder = PlaceHolderImages.find(p => p.id === 'image-generation-placeholder')!;

export default function ThreeDVisualExplanationPage() {
  const [prompt, setPrompt] = useState('');
  const [outputUrl, setOutputUrl] = useState<string>(placeholder.imageUrl);
  const [isGenerating, setIsGenerating] = useState(false);
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
  
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  }

  return (
    <div className="flex flex-col gap-8">
        <form onSubmit={handlePromptSubmit} className="w-full">
            <PromptInputWrapper>
                <PromptInput 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a concept to visualize in 3D..."
                    disabled={isGenerating}
                />
                <PromptInputActions>
                    <Button type="submit" size="icon" disabled={isGenerating || !prompt.trim()} className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Cuboid/>}
                    </Button>
                </PromptInputActions>
            </PromptInputWrapper>
        </form>

        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="font-headline">Result</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center aspect-square relative">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        <p>Generating 3D visualization...</p>
                    </div>
                ) : (
                    <Image 
                        src={outputUrl} 
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
