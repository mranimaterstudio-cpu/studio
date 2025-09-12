'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Experiment, Message, Personality } from '@/lib/types';
import { generatePromptSuggestions } from '@/ai/flows/generate-prompt-suggestions';
import { Bot, User, Sparkles, Save, Loader2 } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const personalityPrompts: Record<Personality, string> = {
  general: "You are a helpful general-purpose AI assistant.",
  creative: "You are a creative muse, ready to inspire with imaginative ideas and stories.",
  technical: "You are a technical expert, providing precise and detailed explanations on complex topics.",
  sarcastic: "You are a sarcastic AI with a dry wit, but you're still helpful in your own way.",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [personality, setPersonality] = useState<Personality>('general');
  const [experiments, setExperiments] = useLocalStorage<Experiment[]>('experiments', []);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    const userMessage: Message = { id: generateId(), role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: generateId(),
        role: 'assistant',
        content: `As a ${personality} AI, I'd say: "${content}" is an interesting thought.`,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSaveExperiment = () => {
    if (messages.length === 0) {
      toast({
        title: 'Cannot save',
        description: 'There are no messages in the conversation to save.',
        variant: 'destructive',
      });
      return;
    }
    const newExperiment = {
      id: generateId(),
      type: 'chat' as const,
      timestamp: Date.now(),
      personality,
      messages,
    };
    setExperiments([...experiments, newExperiment]);
    toast({
      title: 'Experiment Saved',
      description: 'Your chat conversation has been saved to your history.',
    });
  };

  const handleGenerateSuggestions = async () => {
    setIsSuggestionsLoading(true);
    setSuggestions([]);
    try {
      const response = await generatePromptSuggestions({ feature: 'chatbot' });
      setSuggestions(response.suggestions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate prompt suggestions.',
        variant: 'destructive',
      });
    }
    setIsSuggestionsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col gap-4">
      <Card className="flex-1 flex flex-col bg-card/50">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-bold font-headline">Chatbot</h2>
            <div className="flex items-center gap-2">
              <Select value={personality} onValueChange={(v) => setPersonality(v as Personality)}>
                <SelectTrigger className="w-[180px] shadow-sm shadow-primary/20">
                  <SelectValue placeholder="Select Personality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="sarcastic">Sarcastic</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSaveExperiment} variant="outline" className="shadow-sm shadow-primary/20">
                <Save className="mr-2" /> Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 relative">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-16">
                  <Bot className="mx-auto h-12 w-12 mb-4" />
                  <p>Start a conversation with the AI. <br/> Or get some inspiration with prompt suggestions!</p>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 border-2 border-primary shadow-lg shadow-primary/30">
                      <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-md p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 border-2 border-accent shadow-lg shadow-accent/30">
                      <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-start gap-4">
                     <Avatar className="w-8 h-8 border-2 border-primary shadow-lg shadow-primary/30">
                      <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-md p-3 rounded-lg bg-secondary flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t flex-col items-start gap-2">
           <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => handleSendMessage(s)}>{s}</Badge>
            ))}
          </div>
          <div className="w-full flex items-center gap-2">
            <Button onClick={handleGenerateSuggestions} variant="ghost" size="icon" disabled={isSuggestionsLoading}>
              {isSuggestionsLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-primary" />}
            </Button>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="flex-1 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="shadow-md shadow-primary/30">
                Send
              </Button>
            </form>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
