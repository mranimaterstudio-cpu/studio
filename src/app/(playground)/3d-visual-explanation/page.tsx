'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Cuboid } from 'lucide-react';
import { PromptInput, PromptInputWrapper, PromptInputActions } from '@/components/ui/prompt-input';
import { generateVisualExplanation } from '@/ai/flows/generate-visual-explanation';

export default function ThreeDVisualExplanationPage() {
  const [prompt, setPrompt] = useState('');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now());
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
       toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate a 3D explanation.',
        variant: 'destructive',
      });
      return;
    };
    setIsGenerating(true);
    setOutputUrl(null);
    
    try {
      const result = await generateVisualExplanation(prompt);
      if (result.videoUrl) {
        setOutputUrl(result.videoUrl);
        setVideoKey(Date.now()); // Force the video element to re-load
      } else {
        throw new Error("Video generation failed to produce a URL.");
      }
    } catch (error) {
       toast({
        title: 'Generation Failed',
        description: 'Could not generate the visual explanation. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    }

    setIsGenerating(false);
  };
  
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  }

  return (
    <div className="flex flex-col gap-8">
        <form onSubmit={handlePromptSubmit} className="w-full" suppressHydrationWarning>
            <PromptInputWrapper>
                <PromptInput 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a concept to visualize in 3D..."
                    disabled={isGenerating}
                    suppressHydrationWarning
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
            <CardContent className="flex items-center justify-center aspect-video relative">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        <p>Generating 3D visualization... (this may take a minute)</p>
                    </div>
                ) : outputUrl ? (
                    <video
                        key={videoKey}
                        src={outputUrl}
                        controls
                        className="w-full h-full rounded-md object-cover"
                        autoPlay
                        muted
                        loop
                    />
                ) : (
                    <div className="text-center text-muted-foreground">
                        <Cuboid className="mx-auto h-12 w-12 mb-4" />
                        <p>Enter a prompt to generate a visual explanation.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
