'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand, Cuboid } from 'lucide-react';
import { PromptInput, PromptInputWrapper } from '@/components/ui/prompt-input';
import { find3dModel } from '@/ai/flows/find-3d-model';
import Image from 'next/image';


export function ImageGenerationPageClient() {
  const [prompt, setPrompt] = useState('');
  const [modelUid, setModelUid] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to search for a 3D model.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    setModelUid(null);

    try {
      const result = await find3dModel(prompt);
      if (result.modelUid) {
        setModelUid(result.modelUid);
      } else {
        toast({
          title: 'No models found',
          description:
            'Could not find a matching 3D model. Please try a different search term.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Search Failed',
        description:
          'Could not search for the 3D model. Please check the console for details.',
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
            <Cuboid /> 3D Model Finder
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
                  placeholder="e.g., A futuristic car"
                  disabled={isGenerating}
                  suppressHydrationWarning
                />
              </PromptInputWrapper>
              <p className="text-xs text-muted-foreground">
                Enter a concept and the AI will find a 3D model from Sketchfab.
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
                Search
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
              <p>Searching for 3D model...</p>
            </div>
          ) : modelUid ? (
             <div className="relative aspect-video w-full max-w-2xl rounded-md overflow-hidden border">
                <iframe
                    title="Sketchfab Viewer"
                    src={`https://sketchfab.com/models/${modelUid}/embed?autospin=1&autostart=1`}
                    allowFullScreen
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    className="w-full h-full"
                ></iframe>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
                <Cuboid className="mx-auto h-12 w-12 mb-4" />
                <p>Your 3D model will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
