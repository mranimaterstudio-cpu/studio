'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Cuboid } from 'lucide-react';
import { PromptInput, PromptInputWrapper, PromptInputActions } from '@/components/ui/prompt-input';

export default function ThreeDVisualExplanationPage() {
  const [prompt, setPrompt] = useState('');
  const [outputUrl, setOutputUrl] = useState<string>('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now());
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
      // In a real app, you'd generate a video and get a new URL.
      // For this mock, we'll just re-use a placeholder and update the key to force re-render.
      setOutputUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      setVideoKey(Date.now()); // Force the video element to re-load
      setIsGenerating(false);
    }, 2000);
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
                        <p>Generating 3D visualization...</p>
                    </div>
                ) : (
                    <video
                        key={videoKey}
                        src={outputUrl}
                        controls
                        className="w-full h-full rounded-md object-cover"
                        autoPlay
                        muted
                        loop
                    />
                )}
            </CardContent>
        </Card>
    </div>
  );
}
