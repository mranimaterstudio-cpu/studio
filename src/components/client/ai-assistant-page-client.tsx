'use client';

import { assistantChat } from '@/ai/flows/assistant-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Sparkles, User, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateId } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { PromptInput, PromptInputWrapper, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input';


function PaperPlaneIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
            <path d="M232.22,108.34,50.43,26.55a10,10,0,0,0-13.42,13.42L85.19,128,37,216.05a10,10,0,0,0,6,17.41,10.06,10.06,0,0,0,7.44-2.56L232.22,147.66a10,10,0,0,0,0-18.1l.24-.06A10,10,0,0,0,232.22,108.34Z" />
        </svg>
    )
}

export function AiAssistantPageClient() {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        setTimeout(() => {
            if (scrollAreaViewportRef.current) {
                scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
            }
        }, 0);
      }, [messages]);


    const handleSendMessage = async () => {
        if (!prompt.trim()) return;

        const userMessage: Message = { id: generateId(), role: 'user', content: prompt };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentPrompt = prompt;
        setPrompt('');
        setIsLoading(true);

        try {
            const response = await assistantChat(currentPrompt);
            const aiResponse: Message = {
                id: generateId(),
                role: 'assistant',
                content: response.content,
            };
            setMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error generating response',
                description: 'Please check the console for more details.',
                variant: 'destructive',
            });
            setMessages(messages); // Revert messages if AI fails
        }
        setIsLoading(false);
    };

    return (
        <Card className="relative flex flex-col h-[calc(100vh-8rem)] w-full overflow-hidden bg-background rounded-2xl bg-vignette border-0 z-20">
            <CardContent className="p-0 flex-1 relative">
                <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
                    <div className="p-6 space-y-6 max-w-3xl mx-auto">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                            {message.role === 'assistant' && (
                                <Avatar className="w-8 h-8 border-2 border-primary shadow-lg shadow-primary/30">
                                <AvatarFallback className="bg-transparent"><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`max-w-md p-3 rounded-lg ${message.role === 'user' ? 'bg-primary/80 text-primary-foreground' : 'bg-secondary/80'}`}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.role === 'user' && (
                                <Avatar className="w-8 h-8 border-2 border-accent shadow-lg shadow-accent/30">
                                <AvatarFallback className="bg-transparent"><User className="w-5 h-5 text-accent" /></AvatarFallback>
                                </Avatar>
                            )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-4">
                                <Avatar className="w-8 h-8 border-2 border-primary shadow-lg shadow-primary/30">
                                    <AvatarFallback className="bg-transparent"><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                                </Avatar>
                                <div className="max-w-md p-3 rounded-lg bg-secondary/80 flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 flex-col items-start gap-2 z-10">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="w-full max-w-3xl mx-auto">
                    <PromptInputWrapper>
                        <PromptInputAction suppressHydrationWarning>
                            <Sparkles className="text-primary"/>
                        </PromptInputAction>
                        <PromptInput
                            type="text"
                            placeholder="Type your message..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                            suppressHydrationWarning
                        />
                        <PromptInputActions>
                            <PromptInputAction suppressHydrationWarning>
                                <Search className="text-muted-foreground" />
                            </PromptInputAction>
                            <Button
                                type="submit"
                                size="icon"
                                className="w-9 h-9 rounded-full bg-primary cursor-pointer"
                                disabled={isLoading || !prompt.trim()}
                                suppressHydrationWarning
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <PaperPlaneIcon className="text-primary-foreground w-4 h-4 fill-current" />}
                            </Button>
                        </PromptInputActions>
                    </PromptInputWrapper>
                </form>
            </CardFooter>
        </Card>
    );
}
