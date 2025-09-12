'use client';

import { assistantChat } from '@/ai/flows/assistant-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, Mic, PaperPlane, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        <div id="particles" className="absolute inset-0 -z-10">
            {particles.map((p) => (
                <div key={p.id} className="particle" style={p.style} />
            ))}
        </div>
    );
}


export function AiAssistantPageClient() {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setResult('');

        try {
            const response = await assistantChat(prompt);
            setResult(response.content);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error generating response',
                description: 'Please check the console for more details.',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };


    const examplePrompts = [
        'How to identify if the pashmina shawl I am buying is genuine?',
        'Explain the concept of photosynthesis like I\'m five.',
        'What are the key differences between Python and JavaScript?',
    ];


    return (
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] w-full overflow-hidden bg-transparent rounded-2xl p-4 md:p-8">
            <Particles />
            <div className="w-full max-w-3xl px-4 sm:px-8 z-10">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold gradient-text mb-3">AI Lab</h1>
                    <p className="text-gray-400 text-xl">Ask anything, get intelligent responses</p>
                </div>
                
                <div className="gradient-border mb-10">
                    <div className="input-container bg-background/80">
                        <input
                            type="text"
                            placeholder="Ask anything..."
                            className="bg-transparent w-full outline-none text-xl px-6 py-4 text-white"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            disabled={isLoading}
                        />
                        <div className="flex space-x-1 sm:space-x-3 pr-2">
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-blue-400 hover:bg-gray-800 transition">
                                <Mic className="text-xl" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-green-400 hover:bg-gray-800 transition">
                                <Camera className="text-xl" />
                            </Button>
                            <Button
                                size="icon"
                                className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 cursor-pointer pulse-animation"
                                onClick={handleGenerate}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <PaperPlaneIcon className="text-gray-900 w-6 h-6 fill-current" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center mb-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                )}

                {result && (
                    <Card className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardContent className="p-6">
                            <p className="whitespace-pre-wrap">{result}</p>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !result && (
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
                )}
            </div>
        </div>
    );
}
