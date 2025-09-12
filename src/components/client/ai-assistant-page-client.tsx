
'use client';

import { assistantChat } from '@/ai/flows/assistant-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, User, Camera, VideoOff, CircleDot, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateId } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { PromptInput, PromptInputWrapper, PromptInputActions } from '@/components/ui/prompt-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';


function PaperPlaneIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
            <path d="M232.22,108.34,50.43,26.55a10,10,0,0,0-13.42,13.42L85.19,128,37,216.05a10,10,0,0,0,6,17.41,10.06,10.06,0,0,0,7.44-2.56L232.22,147.66a10,10,0,0,0,0-18.1l.24-.06A10,10,0,0,0,232.22,108.34Z" />
        </svg>
    )
}

const examplePrompts = [
    "How to identify if the pashmina shawl I am buying is genuine?",
    "Explain the concept of photosynthesis like I'm five.",
    "What are the key differences between Python and JavaScript?",
];

export function AiAssistantPageClient() {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (scrollAreaViewportRef.current) {
            scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (showCamera) {
          const getCameraPermission = async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              setHasCameraPermission(true);
    
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            } catch (error) {
              console.error('Error accessing camera:', error);
              setHasCameraPermission(false);
              toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use this app.',
              });
            }
          };
    
          getCameraPermission();
          
          return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
          }
        }
      }, [showCamera, toast]);


    const handleSendMessage = async (messageContent?: string) => {
        const content = messageContent || prompt;
        if (!content.trim() && !imageUrl) return;

        setIsLoading(true);

        const userMessage: Message = { id: generateId(), role: 'user', content: content || "Image Analysis" };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setPrompt('');
        
        try {
            const response = await assistantChat(content, imageUrl || undefined);
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
        
        setImageUrl(null);
        setShowCamera(false);
        setIsLoading(false);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/png');
                setImageUrl(dataUrl);
                setShowCamera(false);
            }
        }
      }

      const handleRemoveImage = () => {
        setImageUrl(null);
      }

    return (
        <div className="h-full flex flex-col w-full bg-transparent" suppressHydrationWarning>
        {messages.length === 0 ? (
            <div className="flex flex-col h-full w-full justify-center items-center">
                <div className="w-full max-w-3xl px-8 text-center">
                    <h1 className="text-5xl font-bold gradient-text mb-3">AI Lab</h1>
                    <p className="text-gray-400 text-xl mb-12">Ask anything, get intelligent responses</p>

                    {showCamera ? (
                         <div className='w-full flex flex-col items-center justify-center gap-4 bg-transparent mb-10'>
                            <div className="relative aspect-video w-full border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                                    {hasCameraPermission === null && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                                    {hasCameraPermission === false && (
                                        <Alert variant="destructive">
                                            <VideoOff className="h-4 w-4"/>
                                            <AlertTitle>Camera Access Denied</AlertTitle>
                                            <AlertDescription>
                                                Please enable camera permissions in your browser settings.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {hasCameraPermission && (
                                        <>
                                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                            <Button onClick={handleCapture} className="absolute bottom-4 z-10 shadow-lg shadow-primary/40 rounded-full" size="lg" suppressHydrationWarning>
                                                <CircleDot className="mr-2"/> Capture
                                            </Button>
                                        </>
                                    )}
                            </div>
                            <Button onClick={() => setShowCamera(false)} variant="ghost" suppressHydrationWarning>Close Camera</Button>
                        </div>
                    ) : (
                        <>
                        {imageUrl && (
                            <div className="relative w-48 h-32 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-primary">
                                <Image src={imageUrl} alt="Captured content" layout="fill" className="object-cover"/>
                                 <Button variant="destructive" size="icon" className="absolute top-1 right-1 z-10 h-6 w-6" onClick={handleRemoveImage} suppressHydrationWarning>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                        <div className="gradient-border mb-10">
                            <div className="input-container bg-[rgba(18,18,18,0.9)] flex items-center p-2 rounded-full">
                                <input
                                    type="text"
                                    placeholder="Ask anything or use the camera to scan text..."
                                    className="bg-transparent w-full outline-none text-xl px-6 py-4"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSendMessage();
                                    }}
                                    suppressHydrationWarning
                                />
                                <div className="flex space-x-1 pr-2">
                                     <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-primary/10" onClick={() => setShowCamera(true)} suppressHydrationWarning>
                                        <Camera className="text-green-400" />
                                    </Button>
                                    <Button size="icon" className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 pulse-animation" onClick={() => handleSendMessage()} suppressHydrationWarning>
                                        <PaperPlaneIcon className="w-6 h-6 fill-current" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />

                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-center text-gray-300">Try asking:</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {examplePrompts.map((p, i) => (
                                <div key={i} className="example-card p-4 rounded-lg cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10" onClick={() => handleSendMessage(p)} suppressHydrationWarning>
                                    <p className="text-lg">{p}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <Card className="h-full flex flex-col w-full bg-card/50 rounded-2xl overflow-hidden">
                <CardContent className="p-0 flex-1 relative">
                    <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
                        <div className="p-6 space-y-6 max-w-3xl mx-auto">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`} suppressHydrationWarning>
                                    {message.role === 'assistant' && (
                                        <Avatar className="w-8 h-8 border-2 border-primary shadow-lg shadow-primary/30" suppressHydrationWarning>
                                            <AvatarFallback className="bg-transparent" suppressHydrationWarning><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-md p-3 rounded-lg ${message.role === 'user' ? 'bg-primary/80 text-primary-foreground' : 'bg-secondary/80'}`} suppressHydrationWarning>
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="w-8 h-8 border-2 border-accent shadow-lg shadow-accent/30" suppressHydrationWarning>
                                            <AvatarFallback className="bg-transparent" suppressHydrationWarning><User className="w-5 h-5 text-accent" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-4" suppressHydrationWarning>
                                    <Avatar className="w-8 h-8 border-2 border-primary shadow-lg shadow-primary/30" suppressHydrationWarning>
                                        <AvatarFallback className="bg-transparent" suppressHydrationWarning><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-md p-3 rounded-lg bg-secondary/80 flex items-center" suppressHydrationWarning>
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 flex-col items-start gap-2 z-10">
                     {imageUrl && (
                        <div className="relative w-24 h-16 mx-auto mb-2 rounded-md overflow-hidden border">
                             <Image src={imageUrl} alt="Captured content" layout="fill" className="object-cover"/>
                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 z-10 h-5 w-5" onClick={handleRemoveImage} suppressHydrationWarning>
                                <X className="h-3 w-3"/>
                            </Button>
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="w-full max-w-3xl mx-auto">
                        <PromptInputWrapper>
                            <PromptInput
                                type="text"
                                placeholder="Type your message..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isLoading}
                                suppressHydrationWarning
                            />
                            <PromptInputActions>
                                <Button
                                  onClick={() => setShowCamera(true)}
                                  size="icon"
                                  variant="ghost"
                                  className="w-9 h-9 rounded-full text-muted-foreground"
                                  suppressHydrationWarning
                                >
                                  <Camera/>
                                </Button>
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="w-9 h-9 rounded-full bg-primary cursor-pointer"
                                    disabled={isLoading || (!prompt.trim() && !imageUrl)}
                                    suppressHydrationWarning
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : <PaperPlaneIcon className="text-primary-foreground w-4 h-4 fill-current" />}
                                </Button>
                            </PromptInputActions>
                        </PromptInputWrapper>
                    </form>
                </CardFooter>
            </Card>
        )}
        </div>
    );
}
