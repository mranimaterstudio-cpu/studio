'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand } from 'lucide-react';
import { PromptInput, PromptInputWrapper } from '@/components/ui/prompt-input';
import { generateImage } from '@/ai/flows/generate-image';

export function ImageGenerationPageClient() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate an image.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    setImageUrl(null);

    try {
      const generationResult = await generateImage(prompt);
      if (generationResult.imageUrl) {
        setImageUrl(generationResult.imageUrl);
      } else {
        toast({
          title: 'Generation failed',
          description: 'Could not generate an image. Please try again.',
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
            <Wand /> Image Generation
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
                  placeholder="e.g., A futuristic cityscape at sunset"
                  disabled={isGenerating}
                  suppressHydrationWarning
                />
              </PromptInputWrapper>
              <p className="text-xs text-muted-foreground">
                Enter a prompt and the AI will generate an image for you.
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
              <p>Generating your image...</p>
            </div>
          ) : imageUrl ? (
            <div className="relative aspect-square w-full rounded-md overflow-hidden border">
              <Image src={imageUrl} alt={prompt} fill className="object-cover" />
            </div>
          ) : (
            <div className="text-center text-muted-foreground pt-16">
                <Wand className="mx-auto h-12 w-12 mb-4" />
                <p>Your generated image will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
