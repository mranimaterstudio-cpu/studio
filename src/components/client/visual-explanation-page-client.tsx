'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand, Cuboid } from 'lucide-react';
import { PromptInput, PromptInputWrapper } from '@/components/ui/prompt-input';
import { generateHybridVisualExplanation, HybridVisualExplanation } from '@/ai/flows/generate-hybrid-visual-explanation';

export function VisualExplanationPageClient() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<HybridVisualExplanation | null>(null);
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
      const generationResult = await generateHybridVisualExplanation(prompt);
      setResult(generationResult);
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
            <Wand /> Hybrid Explanation
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
                  placeholder="e.g., How does a car engine work?"
                  disabled={isGenerating}
                  suppressHydrationWarning
                />
              </PromptInputWrapper>
              <p className="text-xs text-muted-foreground">
                Enter a concept and the AI will find a 3D model or generate an image, along with an explanation.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="flex-1 shadow-md shadow-primary/30"
                suppressHydrationWarning
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
                {result.modelUid ? (
                   <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                        <iframe
                            title="Sketchfab Viewer"
                            src={`https://sketchfab.com/models/${result.modelUid}/embed?autospin=1&autostart=1`}
                            allowFullScreen
                            allow="autoplay; fullscreen; xr-spatial-tracking"
                            className="w-full h-full"
                        ></iframe>
                    </div>
                ) : result.imageUrl && (
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
