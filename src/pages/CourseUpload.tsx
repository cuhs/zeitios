import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, FileText, AlertCircle, Download, Presentation } from "lucide-react";
import { generateSpeech } from '@/lib/elevenlabs';
import { useToast } from "@/hooks/use-toast";

const CourseUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileContent, setFileContent] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slidesUrl, setSlidesUrl] = useState<string | null>(null);
  const [slidesPreviewUrl, setSlidesPreviewUrl] = useState<string | null>(null);
  const [slidesMessage, setSlidesMessage] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      setErrorMessage(null);
      
      try {
        if (selectedFile.type === 'text/plain') {
          const text = await selectedFile.text();
          setFileContent(text);
        } else if (selectedFile.type === 'application/pdf') {
          // For PDF files, we need to extract the text
          const formData = new FormData();
          formData.append('file', selectedFile);
          
          const response = await fetch('http://localhost:3001/api/extract-text', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to extract text from PDF');
          }
          
          const data = await response.json();
          setFileContent(data.text);
        } else {
          setFileContent('');
          setErrorMessage('Unsupported file type. Please upload a PDF or text file.');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setErrorMessage('Failed to process file: ' + (error as Error).message);
        setFileContent('');
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setAudioBlob(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    const simulateProgress = () => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    };

    const interval = setInterval(simulateProgress, 500);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(100);
      handleGenerateAudio();
    }, 3000);
  };

  const handleGenerateAudio = async () => {
    if (!fileContent) {
      setErrorMessage('No content to generate audio from. Please upload a valid text file.');
      return;
    }
    
    setIsGeneratingAudio(true);
    setAudioProgress(0);
    setErrorMessage(null);
    
    try {
      const textToConvert = fileContent.slice(0, 1000);
      
      console.log('Generating audio for text:', textToConvert.substring(0, 50) + '...');
      
      const audioBlob = await generateSpeech({
        text: textToConvert,
        onProgress: (progress) => {
          setAudioProgress(progress);
        }
      });
      
      setAudioBlob(audioBlob);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      if (audioRef.current) {
        audioRef.current.src = url;
      }
      
      console.log('Audio generation complete, URL created:', url);
    } catch (error) {
      console.error('Failed to generate audio:', error);
      setErrorMessage('Failed to generate audio. Please check the console for details.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };
  
  const handleDownloadAudio = () => {
    if (!audioBlob || !audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${file?.name || 'course'}_audio.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerateSlides = async () => {
    if (!fileContent) {
      setErrorMessage('No content to generate slides from. Please upload a valid text file.');
      return;
    }
    setIsGeneratingSlides(true);
    setErrorMessage(null);
    try {
      console.log('=== Generating Slides ===');
      console.log('Content length:', fileContent.length);
      
      const response = await fetch('http://localhost:3001/api/generate-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: fileContent }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('=== Client Response Debug ===');
      console.log('Full response:', data);
      
      if (data.error) {
        console.error('Error in response:', data.error);
        console.error('Debug info:', data.debug);
        throw new Error(data.error + (data.debug ? `\nDebug info: ${JSON.stringify(data.debug, null, 2)}` : ''));
      }
      
      if (!data.downloadUrl && !data.url) {
        console.error('Missing URLs in response:', data);
        throw new Error('Failed to get presentation URLs. Response: ' + JSON.stringify(data, null, 2));
      }
      
      // Use either downloadUrl or url
      const downloadUrl = data.downloadUrl || data.url;
      const pdfUrl = data.pdfUrl || (downloadUrl ? downloadUrl.replace('.pptx', '.pdf') : null);
      
      console.log('Setting URLs:', {
        downloadUrl,
        pdfUrl
      });
      
      setSlidesUrl(downloadUrl);
      setSlidesPreviewUrl(pdfUrl);
      setSlidesMessage(data.message || 'Slides generated successfully');
      setPdfUrl(pdfUrl);
      
      console.log('State after update:', {
        slidesUrl: downloadUrl,
        slidesPreviewUrl: pdfUrl,
        slidesMessage: data.message,
        pdfUrl: pdfUrl
      });

      toast({
        title: "Slides generated successfully",
        description: "Your presentation is ready to preview and download.",
      });
    } catch (error: any) {
      console.error('Error generating slides:', error);
      setErrorMessage('Failed to generate slides: ' + error.message);
      toast({
        title: "Error generating slides",
        description: error.message || "There was a problem generating your slides.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const handleDownloadSlides = () => {
    if (!slidesUrl) return;
    const a = document.createElement('a');
    a.href = slidesUrl;
    a.download = `${file?.name || 'course'}_slides.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {apiKeyMissing && (
          <div className="bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">ElevenLabs API Key Required</h3>
              <p className="text-amber-700 text-sm mt-1">
                To use the audio generation feature, please set your ElevenLabs API key in the src/lib/elevenlabs.ts file.
              </p>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
            </div>
          </div>
        )}
      
        <div className="relative mb-16">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-9xl font-black text-gray-50 select-none">
            CREATE
          </div>
          <div className="text-center relative z-10">
            <h1 className="text-4xl font-black text-black mb-6 tracking-tight">
              Course Content to Video Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your course content and let our AI create an engaging video presentation
              with ElevenLabs audio narration that brings your material to life.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-10 border-gray-100 bg-white rounded-none shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-base font-semibold text-black">
                  Upload Course Content
                </label>
                <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-none p-8 text-center">
                  <Input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer hidden"
                    id="file-upload"
                  />
                  {!file && (
                    <div className="space-y-4">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div>
                        <label 
                          htmlFor="file-upload"
                          className="text-sm text-black font-medium cursor-pointer hover:underline"
                        >
                          Click to upload a file
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                          or drag and drop
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Supported formats: TXT, DOC, DOCX, PDF
                      </p>
                    </div>
                  )}
                  
                  {file && (
                    <div className="inline-flex items-center space-x-3 px-4 py-3 bg-white border border-gray-200">
                      <FileText className="h-5 w-5 text-black" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-black">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • <label htmlFor="file-upload" className="cursor-pointer hover:underline">Change</label>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {audioBlob && !isGeneratingAudio && (
                <div className="bg-gray-50 border border-gray-200 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium">Audio Preview</p>
                    <p className="text-xs text-gray-500 mb-2">Generated with ElevenLabs</p>
                    <audio 
                      ref={audioRef} 
                      controls 
                      className="w-full" 
                      src={audioUrl || undefined}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={handleDownloadAudio}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}

              {isGeneratingAudio && (
                <div className="flex items-center p-4 bg-gray-50 border border-gray-200">
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-black" />
                  <div className="w-full">
                    <p className="text-sm font-medium">Generating audio...</p>
                    <div className="w-full bg-gray-200 h-1 mt-2">
                      <div 
                        className="bg-black h-1" 
                        style={{ width: `${audioProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading || isGeneratingAudio}
                className="w-full h-12 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing... {uploadProgress}%
                  </>
                ) : audioBlob ? (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Generate Video with Audio
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Generate Audio & Video
                  </>
                )}
              </Button>

              <Button
                onClick={handleGenerateSlides}
                disabled={!fileContent || isGeneratingSlides || isUploading || isGeneratingAudio}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl mt-4"
              >
                {isGeneratingSlides ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Slides...
                  </>
                ) : (
                  <>
                    <Presentation className="mr-2 h-5 w-5" />
                    Generate Slides
                  </>
                )}
              </Button>

              {/* Slides Download Section */}
              {slidesUrl && !isGeneratingSlides && (
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-8 mt-8 rounded-2xl shadow-lg">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Presentation className="h-6 w-6 text-blue-600" />
                      <p className="text-base font-semibold text-gray-900">Generated Slides</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">{slidesMessage || "Your slides are ready to download"}</p>
                    
                    {/* Action Button */}
                    <div className="flex justify-end">
                      <button 
                        onClick={handleDownloadSlides}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Download className="h-5 w-5" />
                        Download Slides
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Preview Section */}
              {audioBlob && !isGeneratingAudio && (
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-8 mt-8 rounded-2xl shadow-lg">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Upload className="h-6 w-6 text-blue-600" />
                      <p className="text-base font-semibold text-gray-900">Audio Preview</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Generated with ElevenLabs</p>
                    <audio 
                      ref={audioRef} 
                      controls 
                      className="w-full mb-6" 
                      src={audioUrl || undefined}
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleDownloadAudio}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Download className="h-5 w-5" />
                        Download Audio
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isGeneratingAudio && (
                <div className="flex items-center p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-lg mt-8">
                  <Loader2 className="mr-4 h-6 w-6 animate-spin text-blue-600" />
                  <div className="w-full">
                    <p className="text-base font-medium text-gray-900 mb-3">Generating audio...</p>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-blue-700 h-full transition-all duration-300" 
                        style={{ width: `${audioProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseUpload; 