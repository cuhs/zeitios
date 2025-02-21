import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUploadComplete: (response: string) => void;
}

const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File uploaded")
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
  
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("File upload failed.");
  
      const data = await response.json();
      onUploadComplete(data.reply || "No response from AI assistant.");
    } catch (error) {
      console.error("Upload error:", error);
      onUploadComplete("Error uploading file or calling API.");
    } finally {
      setIsUploading(false);
    }
  };  

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".txt, .pdf, .docx, .jpg, .png, .jpeg"
      />
      <Button onClick={handleUpload} disabled={isUploading || !file}>
        {isUploading ? "Uploading..." : "Upload file"}
      </Button>
    </div>
  );
};

export { FileUpload };