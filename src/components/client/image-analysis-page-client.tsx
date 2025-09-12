
'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ScanSearch, Upload, X, Camera, CircleDot, Video, VideoOff } from 'lucide-react';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { Badge } from '@/components/ui/badge';
import { PromptInput, PromptInputWrapper } from '@/components/ui/prompt-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ImageAnalysisPageClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('Analyze this image.');
  const [analysis, setAnalysis] = useState<{ isPlant: boolean, commonName: string, latinName: string, isHealthy: boolean, diagnosis: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'webcam'>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (inputMode === 'webcam') {
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
      
      // Cleanup function to stop video stream
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [inputMode, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload or capture an image to analyze.',
        variant: 'destructive',
      });
      return;
    }
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeImage({ 
        photoDataUri: imageUrl,
        description: description,
       });
      setAnalysis({
        isPlant: result.identification.isPlant,
        commonName: result.identification.commonName,
        latinName: result.identification.latinName,
        isHealthy: result.diagnosis.isHealthy,
        diagnosis: result.diagnosis,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Analysis Failed',
        description: 'Something went wrong while analyzing the image.',
        variant: 'destructive',
      });
    }
    setIsAnalyzing(false);
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysis(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

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
        }
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="bg-card/50">
        <CardHeader className="gap-4">
          <CardTitle className="font-headline flex items-center gap-2">
            <ScanSearch />
            Image Analysis
          </CardTitle>
          <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as 'upload' | 'webcam')}>
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" suppressHydrationWarning><Upload className="mr-2 h-4 w-4"/> Upload</TabsTrigger>
                  <TabsTrigger value="webcam" suppressHydrationWarning><Camera className="mr-2 h-4 w-4"/> Webcam</TabsTrigger>
              </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <div className="relative aspect-square w-full border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                        <>
                            <Image src={imageUrl} alt="Uploaded for analysis" layout="fill" className="rounded-md object-contain" />
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={handleRemoveImage} suppressHydrationWarning>
                              <X/>
                            </Button>
                        </>
                    ) : inputMode === 'upload' ? (
                       <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-auto p-8 flex flex-col gap-2" suppressHydrationWarning>
                           <Upload className="h-12 w-12" />
                           <span className="font-semibold">Choose File</span>
                       </Button>
                    ) : (
                        <div className='w-full h-full flex flex-col items-center justify-center gap-4 bg-secondary'>
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
                    )}
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>
             <div className="space-y-2">
                <label className="font-medium">Analysis Prompt</label>
                 <PromptInputWrapper>
                    <PromptInput
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What do you want to know about the image?"
                        suppressHydrationWarning
                    />
                 </PromptInputWrapper>
             </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={isAnalyzing || !imageUrl} className="w-full" suppressHydrationWarning>
            {isAnalyzing ? <Loader2 className="mr-2 animate-spin" /> : <ScanSearch className="mr-2" />}
            Analyze Image
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline">Analysis Result</CardTitle>
        </CardHeader>
        <CardContent>
            {isAnalyzing ? (
                 <div className="flex flex-col items-center gap-4 text-muted-foreground pt-16">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <p>Analyzing image...</p>
                </div>
            ) : analysis ? (
                <div className="space-y-4">
                     <div>
                        <h3 className="font-semibold text-lg">Identification</h3>
                        <p><strong>Common Name:</strong> {analysis.commonName}</p>
                        {analysis.isPlant && <p><strong>Latin Name:</strong> <em>{analysis.latinName}</em></p>}
                     </div>
                      <div>
                        <h3 className="font-semibold text-lg">Analysis</h3>
                         <Badge variant={!analysis.isPlant ? 'default' : analysis.isHealthy ? 'default' : 'destructive'} className={!analysis.isPlant ? '' : analysis.isHealthy ? 'bg-green-600' : ''}>
                            {analysis.isPlant ? (analysis.isHealthy ? 'Healthy' : 'Needs Attention') : 'Object Detected'}
                        </Badge>
                        <p className="mt-2 text-muted-foreground">{analysis.diagnosis}</p>
                      </div>
                </div>
            ) : (
                <div className="text-center text-muted-foreground pt-16">
                    <ScanSearch className="mx-auto h-12 w-12 mb-4" />
                    <p>Analysis results will appear here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
