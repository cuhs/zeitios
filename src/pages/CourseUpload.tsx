import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, FileText, PlayCircle, PauseCircle, AlertCircle, Download } from "lucide-react";
import { generateSpeech, getAvailableVoices } from '@/lib/elevenlabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';

const CourseUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileContent, setFileContent] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState('premade/Adam');
  const [voices, setVoices] = useState<any[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const availableVoices = await getAvailableVoices();
        setVoices(availableVoices);
      } catch (error) {
        console.error('Failed to load voices:', error);
      }
    };
    loadVoices();
  }, []);

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
      setIsPlaying(false);
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
        voiceId: selectedVoice,
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
        audioRef.current.onended = () => setIsPlaying(false);
      }
      
      console.log('Audio generation complete, URL created:', url);
    } catch (error) {
      console.error('Failed to generate audio:', error);
      setErrorMessage('Failed to generate audio. Please check the console for details.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };
  
  const togglePlayPause = () => {
    if (!audioRef.current || !audioBlob) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Audio playback error:', error);
        setErrorMessage('Failed to play audio. Please try again.');
      });
    }
    
    setIsPlaying(!isPlaying);
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
    <>
      <NavBar />
      <div className="min-h-screen bg-[#EDF4FF] flex items-center justify-center pt-16">
        <div className="container max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center mb-12 bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-[#2866C5]/10">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-[#2866C5] to-[#2866C5]/70 bg-clip-text text-transparent">
              Course Content Upload
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Upload your course materials to generate an AI-powered teaching video.
              We support PDF, DOCX, and TXT files.
            </p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="mb-8 px-6 py-4 rounded-full hover:bg-[#2866C5]/10 transition-all duration-200"
            >
              Back to Home
            </Button>
          </div>

          {apiKeyMissing && (
            <div className="bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">ElevenLabs API Key Required</h3>
                <p className="text-amber-700 text-sm mt-1">
                  To use the audio generation feature, please set your ElevenLabs API key in the .env file.
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

          <div className="max-w-xl mx-auto">
            <div className="border-2 border-dashed border-[#2866C5]/30 rounded-2xl p-12 text-center bg-white/50 backdrop-blur-sm hover:border-[#2866C5]/50 transition-all duration-200 shadow-lg shadow-[#2866C5]/10">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block w-full"
              >
                <div className="space-y-4">
                  <div className="text-7xl transform transition-transform duration-200 hover:scale-110">📚</div>
                  <div className="text-xl font-medium text-gray-900 mt-4">
                    {file ? file.name : 'Click to upload your course content'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {file ? 'File selected' : 'PDF, DOCX, or TXT files only'}
                  </div>
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-8 space-y-8 animate-fade-in">
                {fileContent && (
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview Content</h2>
                    <div className="max-h-40 overflow-y-auto mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{fileContent}</p>
                    </div>
                  </div>
                )}

                {fileContent && (
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Selection</h2>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.length === 0 ? (
                          <>
                            <SelectItem value="premade/Adam">Adam</SelectItem>
                            <SelectItem value="premade/Rachel">Rachel</SelectItem>
                            <SelectItem value="premade/Clyde">Clyde</SelectItem>
                            <SelectItem value="premade/Domi">Domi</SelectItem>
                          </>
                        ) : (
                          voices.map((voice) => (
                            <SelectItem key={voice.voice_id} value={voice.voice_id}>
                              {voice.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {audioBlob && !isGeneratingAudio && (
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlayPause} className="text-[#2866C5]">
                          {isPlaying ? (
                            <PauseCircle className="h-10 w-10" />
                          ) : (
                            <PlayCircle className="h-10 w-10" />
                          )}
                        </button>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Audio Preview</p>
                          <p className="text-xs text-gray-500">Generated with ElevenLabs</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleDownloadAudio}
                        className="p-2 rounded-full hover:bg-[#2866C5]/10"
                        title="Download audio"
                      >
                        <Download className="h-5 w-5 text-[#2866C5]" />
                      </button>
                    </div>
                    <audio ref={audioRef} className="hidden" controls />
                  </div>
                )}

                {isGeneratingAudio && (
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center">
                      <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#2866C5]" />
                      <div className="w-full">
                        <p className="text-sm font-medium text-gray-900">Generating audio...</p>
                        <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#2866C5] h-1 transition-all duration-300" 
                            style={{ width: `${audioProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || isGeneratingAudio}
                    className="bg-[#2866C5] hover:bg-[#2866C5]/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#2866C5]/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseUpload; 