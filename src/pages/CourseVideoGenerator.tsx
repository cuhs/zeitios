import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Video, FileText, Loader2 } from 'lucide-react';

const CourseVideoGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/generate-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const data = await response.json();
      setVideoUrl(data.videoUrl);
      toast.success('Video generated successfully!');
    } catch (error) {
      toast.error('Failed to generate video. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-gray-50/50">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Course Material Video Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your course materials into engaging video presentations with AI-powered content generation
          </p>
        </div>

        <Card className="p-8 shadow-lg border-gray-100">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, or TXT files
                    </p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!file || isGenerating}
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Generate Video
                </>
              )}
            </Button>

            {videoUrl && (
              <div className="mt-8 space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Generated Video
                </h3>
                <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg bg-black">
                  <video
                    controls
                    className="w-full h-full"
                    src={videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CourseVideoGenerator; 