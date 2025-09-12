
'use client';

import { assistantChat } from '@/ai/flows/assistant-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bot, Camera, Loader2, Mic, PaperPlane, Sparkles, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateId } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { PromptInput, PromptInputWrapper, PromptInputActions } from '@/components/ui/prompt-input';


function PaperPlaneIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
            <path d="M232.22,108.34,50.43,26.55a10,10,0,0,0-13.42,13.42L85.19,128,37,216.05a10,10,0,0,0,6,17.41,10.06,10.06,0,0,0,7.44-2.56L232.22,147.66a10,10,0,0,0,0-18.1l.24-.06A10,10,0,0,0,232.22,108.34Z" />
        </svg>
    )
}

function Particles() {
    const [particles, setParticles] = useState<
        {
            id: number;
            style: React.CSSProperties;
        }[]
    >([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 20 }).map((_, i) => {
            const size = Math.random() * 5 + 2;
            const colors = ['#4FACFE', '#00F2FE', '#43e97b', '#38f9d7', '#fa709a', '#fee140'];
            return {
                id: i,
                style: {
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    animationDelay: `${Math.random() * 4}s`,
                },
            };
        });
        setParticles(newParticles);
    }, []);

    return (
        <div id="particles" className="absolute inset-0 -z-10 h-full w-full">
            {particles.map((p) => (
                <div key={p.id} className="particle" style={p.style} />
            ))}
        </div>
    );
}


export function AiAssistantPageClient() {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
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

    const examplePrompts = [
        'How to identify if the pashmina shawl I am buying is genuine?',
        'Explain the concept of photosynthesis like I\'m five.',
        'What are the key differences between Python and JavaScript?',
    ];

    return (
        <div className="relative flex flex-col h-[calc(100vh-8rem)] w-full overflow-hidden bg-transparent rounded-2xl">
            <Particles />
             <Card className="flex-1 flex flex-col bg-transparent border-0 z-10">
                <CardHeader className="text-center">
                     <h1 className="text-5xl font-bold gradient-text mb-3">AI Lab</h1>
                    <p className="text-gray-400 text-xl">Ask anything, get intelligent responses</p>
                </CardHeader>

                <CardContent className="p-0 flex-1 relative">
                    <ScrollArea className="h-full" ref={scrollAreaRef}>
                        <div className="p-6 space-y-6 max-w-3xl mx-auto">
                            {messages.length === 0 && !isLoading && (
                                <div className="text-center text-gray-300 pt-16">
                                     <div className="mb-8">
                                        <h3 className="text-xl font-semibold mb-4 text-center text-gray-300 flex items-center justify-center gap-2">
                                            <Sparkles className="w-5 h-5 text-cyan-400"/>
                                            Try asking
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {examplePrompts.map((p, i) => (
                                                <div key={i} className="example-card p-4 rounded-lg cursor-pointer" onClick={() => setPrompt(p)}>
                                                    <p className="text-lg text-gray-300">{p}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {messages.map((message) => (
                                <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'assistant' && (
                                    <Avatar className="w-8 h-8 border-2 border-blue-400 shadow-lg shadow-blue-400/30">
                                    <AvatarFallback className="bg-gray-800"><Bot className="w-5 h-5 text-blue-400" /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-md p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-500/80 text-white' : 'bg-white/5 backdrop-blur-sm border border-white/10'}`}>
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="w-8 h-8 border-2 border-cyan-400 shadow-lg shadow-cyan-400/30">
                                    <AvatarFallback className="bg-gray-800"><User className="w-5 h-5 text-cyan-400" /></AvatarFallback>
                                    </Avatar>
                                )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-4">
                                    <Avatar className="w-8 h-8 border-2 border-blue-400 shadow-lg shadow-blue-400/30">
                                        <AvatarFallback className="bg-gray-800"><Bot className="w-5 h-5 text-blue-400" /></AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-md p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 flex-col items-start gap-2 z-10">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="w-full max-w-3xl mx-auto">
                        <div className="gradient-border">
                            <div className="input-container bg-background/80">
                                <input
                                    type="text"
                                    placeholder="Ask anything..."
                                    className="bg-transparent w-full outline-none text-xl px-6 py-4 text-white"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isLoading}
                                    suppressHydrationWarning
                                />
                                <div className="flex space-x-1 sm:space-x-3 pr-2">
                                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-blue-400 hover:bg-gray-800 transition" suppressHydrationWarning>
                                        <Mic className="text-xl" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-green-400 hover:bg-gray-800 transition" suppressHydrationWarning>
                                        <Camera className="text-xl" />
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 cursor-pointer pulse-animation"
                                        disabled={isLoading || !prompt.trim()}
                                        suppressHydrationWarning
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : <PaperPlaneIcon className="text-gray-900 w-6 h-6 fill-current" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
