import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
<<<<<<< Updated upstream
=======
import { TextToSpeechPlayer } from '@/components/TextToSpeechPlayer';
>>>>>>> Stashed changes

const CourseUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
<<<<<<< Updated upstream
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
=======
  const [fileContent, setFileContent] = useState<string>('');
  const navigate = useNavigate();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(file);
>>>>>>> Stashed changes
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    // TODO: Implement file upload logic here
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsUploading(false);
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
                    {selectedFile ? selectedFile.name : 'Click to upload your course content'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedFile ? 'File selected' : 'PDF, DOCX, or TXT files only'}
                  </div>
                </div>
              </label>
            </div>

            {selectedFile && (
<<<<<<< Updated upstream
              <div className="mt-8 text-center animate-fade-in">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-[#2866C5] hover:bg-[#2866C5]/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#2866C5]/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Processing...' : 'Generate my AI teaching video!'}
                </Button>
=======
              <div className="mt-8 space-y-8 animate-fade-in">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview Content</h2>
                  <div className="max-h-40 overflow-y-auto mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{fileContent}</p>
                  </div>
                  <TextToSpeechPlayer text={fileContent} />
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-[#2866C5] hover:bg-[#2866C5]/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#2866C5]/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Processing...' : 'Generate my AI teaching video!'}
                  </Button>
                </div>
>>>>>>> Stashed changes
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseUpload; 