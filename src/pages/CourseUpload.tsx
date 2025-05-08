import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, FileText } from "lucide-react";

const CourseUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

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
    setTimeout(() => clearInterval(interval), 5000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
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
              that brings your material to life.
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
                          {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-none"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Generate Video
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