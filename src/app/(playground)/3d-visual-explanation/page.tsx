'use client';
import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {Loader2, Cuboid} from 'lucide-react';
import {
  PromptInput,
  PromptInputWrapper,
  PromptInputActions,
} from '@/components/ui/prompt-input';
import {generateVisualExplanation} from '@/ai/flows/generate-visual-explanation';

export default function ThreeDVisualExplanationPage() {
  const [prompt, setPrompt] = useState('');
  const [modelUid, setModelUid] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const {toast} = useToast();

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
      const result = await generateVisualExplanation(prompt);
      if (result.modelUid) {
        setModelUid(result.modelUid);
      } else {
        toast({
          title: 'No models found',
          description: 'Could not find a matching 3D model. Please try a different search term.',
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
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Cuboid /> 3D Visual Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePromptSubmit}
            className="w-full"
            suppressHydrationWarning
          >
            <PromptInputWrapper>
              <PromptInput
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter a concept to visualize..."
                disabled={isGenerating}
                suppressHydrationWarning
              />
              <PromptInputActions>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isGenerating || !prompt.trim()}
                  className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30"
                >
                  {isGenerating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Cuboid />
                  )}
                </Button>
              </PromptInputActions>
            </PromptInputWrapper>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Result</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center aspect-video relative">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p>Searching for 3D model...</p>
            </div>
          ) : modelUid ? (
            <iframe
              title="Sketchfab Viewer"
              src={`https://sketchfab.com/models/${modelUid}/embed?autospin=1&autostart=1`}
              allowFullScreen
              allow="autoplay; fullscreen; xr-spatial-tracking"
              className="w-full h-full rounded-md border-0"
            ></iframe>
          ) : (
            <div className="text-center text-muted-foreground">
              <Cuboid className="mx-auto h-12 w-12 mb-4" />
              <p>Enter a prompt to search for a 3D model on Sketchfab.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
