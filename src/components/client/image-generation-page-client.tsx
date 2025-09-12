'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Film } from 'lucide-react';
import { PromptInput, PromptInputWrapper } from '@/components/ui/prompt-input';
import { generateVideo } from '@/ai/flows/generate-video';

export function VideoGenerationPageClient() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate a video.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    setVideoUrl(null);

    try {
      const generationResult = await generateVideo(prompt);
      if (generationResult.videoUrl) {
        setVideoUrl(generationResult.videoUrl);
      } else {
        toast({
          title: 'Generation failed',
          description: 'Could not generate a video. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description:
          'An error occurred during generation. Please check the console for details.',
        variant: 'destructive',
      });
      console.error(error);
    }

    setIsGenerating(false);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Film /> Video Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromptSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="prompt-input" className="font-medium">
                Prompt
              </label>
              <PromptInputWrapper>
                <PromptInput
                  id="prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A majestic dragon soaring over a mystical forest"
                  disabled={isGenerating}
                  suppressHydrationWarning
                />
              </PromptInputWrapper>
              <p className="text-xs text-muted-foreground">
                Enter a prompt and the AI will generate a short video for you.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="flex-1 shadow-md shadow-primary/30"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                Generate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline">Result</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground pt-16">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p>Generating your video... this can take a minute.</p>
            </div>
          ) : videoUrl ? (
            <div className="relative aspect-video w-full rounded-md overflow-hidden border">
              <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="text-center text-muted-foreground pt-16">
                <Film className="mx-auto h-12 w-12 mb-4" />
                <p>Your generated video will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
