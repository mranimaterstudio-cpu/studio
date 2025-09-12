'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand } from 'lucide-react';
import { PromptInput, PromptInputWrapper } from '@/components/ui/prompt-input';
import { generateVisualExplanation } from '@/ai/flows/generate-visual-explanation';
import { z } from 'zod';

const VisualExplanationSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  imagePrompt: z.string(),
});

type VisualExplanation = z.infer<typeof VisualExplanationSchema>;

export function VisualExplanationPageClient() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{explanation: VisualExplanation, imageUrl: string | null} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate a visual explanation.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    setResult(null);

    try {
      const generationResult = await generateVisualExplanation(prompt);
      if (generationResult.explanation && generationResult.imageUrl) {
        setResult(generationResult);
      } else {
        toast({
          title: 'Generation failed',
          description: 'Could not generate a visual explanation. Please try again.',
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
    <div className="flex flex-col gap-8 h-full">
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Wand /> Visual Explanation
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
                  placeholder="e.g., How does photosynthesis work?"
                  disabled={isGenerating}
                  suppressHydrationWarning
                />
              </PromptInputWrapper>
              <p className="text-xs text-muted-foreground">
                Enter a concept and the AI will generate an explanation with a visual.
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

      <Card className="bg-card/50 flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Result</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p>Generating... this may take a moment.</p>
            </div>
          ) : result ? (
             <div className="space-y-4 w-full max-w-2xl mx-auto">
                {result.imageUrl && (
                    <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                        <Image src={result.imageUrl} alt={result.explanation.title} fill className="object-cover" />
                    </div>
                )}
                <div className='space-y-2'>
                    <h3 className="text-xl font-bold">{result.explanation.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.explanation.explanation}</p>
                </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
                <Wand className="mx-auto h-12 w-12 mb-4" />
                <p>Your generated visual and explanation will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
