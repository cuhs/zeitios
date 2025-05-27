import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, FileText, AlertCircle, Download } from "lucide-react";
import { generateSpeech } from '@/lib/elevenlabs';

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
      
      if (selectedFile.type === 'text/plain') {
        const text = await selectedFile.text();
        setFileContent(text);
      } else {
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
                className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-none"
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseUpload; 