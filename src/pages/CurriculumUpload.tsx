import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, FileText, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProcessingStatus {
  stage: 'parsing' | 'introduction' | 'module' | 'conclusion' | 'complete';
  currentModule?: string;
  moduleIndex?: number;
  totalModules?: number;
  progress: number;
}

const CurriculumUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const acceptedFileTypes = ".txt,.pdf,.doc,.docx,.rtf,.md";

  // Set up polling for processing status
  useEffect(() => {
    if (processingId && isProcessing) {
      // Start polling for status updates
      startStatusPolling();
      
      // Clean up interval on unmount
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [processingId, isProcessing]);

  // Start polling for status updates
  const startStatusPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      if (!processingId) return;
      
      try {
        const response = await fetch(`http://localhost:3001/api/processing-status/${processingId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch processing status');
        }
        
        const data = await response.json();
        setProcessingStatus(data.status);
        setProcessingProgress(data.status.progress);
        
        // If complete, fetch the content and stop polling
        if (data.status.stage === 'complete') {
          fetchGeneratedContent();
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      } catch (error: any) {
        console.error('Error fetching processing status:', error);
        setError('Error checking processing status. Please try again.');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setIsProcessing(false);
      }
    }, 2000);
  };
  
  // Fetch the generated content once processing is complete
  const fetchGeneratedContent = async () => {
    if (!processingId) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/generated-content/${processingId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch generated content');
      }
      
      const data = await response.json();
      setGeneratedContent(data.content);
      setIsProcessing(false);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Error fetching generated content:', error);
      setError('Error retrieving content: ' + error.message);
      toast({
        title: "Error retrieving content",
        description: error.message || "There was a problem retrieving the generated content.",
        variant: "destructive",
        duration: 5000,
      });
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setGeneratedContent(null);
      setProcessingStatus(null);
      setProcessingId(null);
      setError(null); // Clear any previous errors
    }
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Content copied to clipboard",
        duration: 3000,
      });
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setGeneratedContent(null);
    setError(null); // Clear any previous errors
    
    try {
      // 1. Read the file content
      const fileContent = await readFileContent(file);
      
      // 2. Start the course generation process
      const response = await fetch('http://localhost:3001/api/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ curriculum: fileContent }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate course generation');
      }
      
      const data = await response.json();
      
      // 3. Store the processing ID for status polling
      setProcessingId(data.processingId);
      
    } catch (error: any) {
      console.error("Error processing curriculum:", error);
      setError('Error processing file: ' + error.message);
      toast({
        title: "Error processing curriculum",
        description: error.message || "There was an error processing your file. Please make sure it's a valid text document.",
        variant: "destructive",
        duration: 5000,
      });
      setProcessingStatus(null);
      setIsProcessing(false);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
    } 
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:3001/api/extract-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract text from file');
      }
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error extracting text:", error);
      throw new Error("Unable to extract text from file");
    }
  };

  const getFileTypeLabel = () => {
    if (!file) return null;
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'docx':
      case 'doc':
        return 'Word Document';
      case 'rtf':
        return 'Rich Text Document';
      case 'md':
        return 'Markdown File';
      default:
        return 'Text File';
    }
  };

  const renderProcessingStatus = () => {
    if (!processingStatus) return null;
    
    switch (processingStatus.stage) {
      case 'parsing':
        return (
          <div className="bg-gray-50 p-4 rounded mt-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing curriculum structure...</span>
            </div>
          </div>
        );
      case 'introduction':
        return (
          <div className="bg-gray-50 p-4 rounded mt-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating course introduction...</span>
            </div>
          </div>
        );
      case 'module':
        return (
          <div className="bg-gray-50 p-4 rounded mt-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                Generating content for {processingStatus.currentModule} 
                {processingStatus.totalModules && ` (${processingStatus.moduleIndex! + 1}/${processingStatus.totalModules})`}
              </span>
            </div>
          </div>
        );
      case 'conclusion':
        return (
          <div className="bg-gray-50 p-4 rounded mt-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating course conclusion...</span>
            </div>
          </div>
        );
      case 'complete':
        return (
          <div className="bg-green-50 p-4 rounded mt-4">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Course content generation complete!</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="relative mb-16">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-9xl font-black text-gray-50 select-none">
            GENERATE
          </div>
          <div className="text-center relative z-10">
            <h1 className="text-4xl font-black text-black mb-6 tracking-tight">
              Curriculum to Course Content Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your curriculum or syllabus file and let our AI generate comprehensive course content
              based on your modules and topics.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-10 border-gray-100 bg-white rounded-none shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-base font-semibold text-black">
                  Upload Curriculum File
                </label>
                <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-none p-8 text-center">
                  <Input
                    type="file"
                    accept={acceptedFileTypes}
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
                          Click to upload a curriculum file
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                          or drag and drop
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Supported formats: TXT, PDF, DOC, DOCX, RTF, MD
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
                          {getFileTypeLabel()} • {(file.size / 1024 / 1024).toFixed(2)} MB • 
                          <label 
                            htmlFor="file-upload"
                            className="cursor-pointer hover:underline ml-1"
                          >
                            Click to change
                          </label>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={processFile}
                  disabled={!file || isProcessing}
                  className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating content... {Math.round(processingProgress)}%
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      Generate Course Content
                    </>
                  )}
                </Button>
                
                {renderProcessingStatus()}
                
                {error && (
                  <div className="bg-red-50 p-4 rounded mt-4">
                    <div className="flex items-start space-x-2 text-red-700">
                      <div className="mt-0.5">⚠️</div>
                      <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {generatedContent && (
            <div className="mt-12 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Generated Course Content</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyContent}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy All
                </Button>
              </div>
              <Card className="p-6 border-gray-100 rounded-none shadow-sm">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm">
                    {generatedContent}
                  </pre>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurriculumUpload; 