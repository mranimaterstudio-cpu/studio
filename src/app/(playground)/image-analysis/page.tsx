'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ScanSearch, Upload, X } from 'lucide-react';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const placeholder = PlaceHolderImages.find(p => p.id === 'image-generation-placeholder')!;

export default function ImageAnalysisPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ isPlant: boolean, commonName: string, latinName: string, isHealthy: boolean, diagnosis: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        description: 'Please upload an image to analyze.',
        variant: 'destructive',
      });
      return;
    }
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeImage({ 
        photoDataUri: imageUrl,
        description: 'A user-uploaded image for analysis.'
       });
      setAnalysis({
        isPlant: result.identification.isPlant,
        commonName: result.identification.commonName,
        latinName: result.identification.latinName,
        isHealthy: result.diagnosis.isHealthy,
        diagnosis: result.diagnosis.diagnosis,
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

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ScanSearch />
            Image Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <label className="font-medium">Upload Image</label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2" /> Choose File
                    </Button>
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {imageFile && <span className="text-sm text-muted-foreground">{imageFile.name}</span>}
                </div>
            </div>

            <div className="relative aspect-square w-full border-2 border-dashed rounded-lg flex items-center justify-center">
                 {imageUrl ? (
                    <>
                        <Image src={imageUrl} alt="Uploaded for analysis" layout="fill" className="rounded-md object-contain" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={handleRemoveImage}>
                           <X/>
                        </Button>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <Upload className="mx-auto h-12 w-12 mb-2" />
                        <p>Your uploaded image will appear here.</p>
                    </div>
                )}
            </div>

        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={isAnalyzing || !imageUrl} className="w-full">
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
                    {analysis.isPlant ? (
                        <>
                            <div>
                                <h3 className="font-semibold text-lg">Identification</h3>
                                <p><strong>Common Name:</strong> {analysis.commonName}</p>
                                <p><strong>Latin Name:</strong> <em>{analysis.latinName}</em></p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Health Status</h3>
                                <Badge variant={analysis.isHealthy ? 'default' : 'destructive'} className="bg-green-600">
                                    {analysis.isHealthy ? 'Healthy' : 'Needs Attention'}
                                </Badge>
                                <p className="mt-2">{analysis.diagnosis}</p>
                            </div>
                        </>
                    ) : (
                        <p>The uploaded image does not appear to be a plant.</p>
                    )}
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
