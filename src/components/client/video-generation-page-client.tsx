'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Film } from 'lucide-react';
import { PromptInput, PromptInputWrapper } from '@/components/ui/prompt-input';
import { generateVideoWithExplanation } from '@/ai/flows/generate-video-with-explanation';
import { z } from 'zod';

const VisualExplanationSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  imagePrompt: z.string(),
});

type VisualExplanation = z.infer<typeof VisualExplanationSchema>;


export function VideoGenerationPageClient() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{explanation: VisualExplanation, videoUrl: string | null} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate a video explanation.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    setResult(null);

    try {
      const generationResult = await generateVideoWithExplanation(prompt);
      if (generationResult.explanation && generationResult.videoUrl) {
        setResult(generationResult);
      } else {
        toast({
          title: 'Generation failed',
          description: 'Could not generate a video explanation. Please try again.',
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
            <Film /> Video Explanation
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
                Enter a concept and the AI will generate an explanation with a video.
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
              <p>Generating... this can take a minute.</p>
            </div>
          ) : result ? (
             <div className="space-y-4 w-full">
                {result.videoUrl && (
                    <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                        <video src={result.videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                    </div>
                )}
                <div className='space-y-2'>
                    <h3 className="text-xl font-bold">{result.explanation.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.explanation.explanation}</p>
                </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground pt-16">
                <Film className="mx-auto h-12 w-12 mb-4" />
                <p>Your generated video and explanation will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
