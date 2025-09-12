'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Experiment, ChatExperiment, ImageExperiment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Trash2, FileText, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { summarizeChatbotConversation } from '@/ai/flows/summarize-chatbot-conversation';


function ChatHistoryCard({ experiment, updateExperiment }: { experiment: ChatExperiment, updateExperiment: (exp: ChatExperiment) => void }) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const conversationText = experiment.messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const result = await summarizeChatbotConversation({ conversationText });
      updateExperiment({ ...experiment, summary: result.summary });
      toast({ title: "Summarization complete!" });
    } catch (error) {
      toast({ title: "Summarization failed", variant: "destructive" });
    }
    setIsSummarizing(false);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Chat Experiment</CardTitle>
        <div className="text-xs text-muted-foreground">{new Date(experiment.timestamp).toLocaleString()}</div>
        <Badge variant="outline" className="w-fit">{experiment.personality}</Badge>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-48">
          <div className="space-y-4 pr-4">
            {experiment.messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-2 text-sm ${message.role === 'user' ? 'justify-end' : ''}`}>
                 {message.role === 'assistant' && (
                    <Avatar className="w-6 h-6 border border-primary">
                      <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs p-2 rounded-md ${message.role === 'user' ? 'bg-primary/20' : 'bg-secondary'}`}>
                    {message.content}
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="w-6 h-6 border border-accent">
                      <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
              </div>
            ))}
          </div>
        </ScrollArea>
        {experiment.summary && (
          <div className="mt-4 p-3 rounded-md bg-secondary border border-dashed border-primary/50">
            <h4 className="font-semibold mb-2 text-primary">Summary</h4>
            <p className="text-sm text-muted-foreground">{experiment.summary}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSummarize} disabled={isSummarizing || !!experiment.summary} variant="ghost" size="sm">
          {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
          {experiment.summary ? 'Summarized' : 'Summarize'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ImageHistoryCard({ experiment }: { experiment: ImageExperiment }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Image Experiment</CardTitle>
        <div className="text-xs text-muted-foreground">{new Date(experiment.timestamp).toLocaleString()}</div>
        <Badge variant="outline" className="w-fit">{experiment.model}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-square w-full">
          <Image src={experiment.imageUrl} alt={experiment.prompt} layout="fill" className="rounded-md object-cover" />
        </div>
        <p className="text-sm p-3 bg-secondary rounded-md">{experiment.prompt}</p>
      </CardContent>
    </Card>
  );
}


export default function HistoryPage() {
  const [experiments, setExperiments] = useLocalStorage<Experiment[]>('experiments', []);
  const { toast } = useToast();

  const sortedExperiments = [...experiments].sort((a, b) => b.timestamp - a.timestamp);
  const chatExperiments = sortedExperiments.filter((e): e is ChatExperiment => e.type === 'chat');
  const imageExperiments = sortedExperiments.filter((e): e is ImageExperiment => e.type === 'image');

  const updateExperiment = (updatedExp: ChatExperiment) => {
    setExperiments(prev => prev.map(e => e.id === updatedExp.id ? updatedExp : e));
  }

  const handleClearHistory = () => {
    setExperiments([]);
    toast({
      title: "History Cleared",
      description: "All saved experiments have been deleted.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Experiment History</h1>
        {experiments.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2" /> Clear All History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your saved experiments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {experiments.length === 0 ? (
        <Card className="text-center py-20">
            <CardContent>
                <h3 className="text-xl font-semibold">No experiments yet!</h3>
                <p className="text-muted-foreground mt-2">Go create some chats or images to see them here.</p>
            </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="chat">
            <TabsList>
            <TabsTrigger value="chat">Chat ({chatExperiments.length})</TabsTrigger>
            <TabsTrigger value="image">Image ({imageExperiments.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {chatExperiments.map((exp) => <ChatHistoryCard key={exp.id} experiment={exp} updateExperiment={updateExperiment} />)}
            </div>
            </TabsContent>
            <TabsContent value="image">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {imageExperiments.map((exp) => <ImageHistoryCard key={exp.id} experiment={exp} />)}
            </div>
            </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
