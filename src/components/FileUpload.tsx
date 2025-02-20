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
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const base64String = await fileToBase64(file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file: base64String }),
      });

      if (!response.ok) throw new Error("File upload failed.");
      console.log(response);
      console.log("response above");

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
        accept=".txt, .pdf, .docx, .jpg, .png"
      />
      <Button onClick={handleUpload} disabled={isUploading || !file}>
        {isUploading ? "Uploading..." : "Upload file"}
      </Button>
    </div>
  );
};

export { FileUpload };