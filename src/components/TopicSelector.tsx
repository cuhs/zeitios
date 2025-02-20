import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload.tsx"

/**
 * TopicSelector component props
 */
interface TopicSelectorProps {
  onTopicSelect(topic: string): void;
}

const suggestedTopics = [
  "Social Media Marketing",
  "Branding & Personal Identity Development",
  "Community Marketing",
  "E-commerce Basics",
];

export const TopicSelector = ({ onTopicSelect }: TopicSelectorProps) => {
  const [customTopic, setCustomTopic] = useState("");
  const [fileResponse, setFileResponse] = useState<string | null>(null);

  const handleUploadComplete = (response: string) => {
    setFileResponse(response);
  };

  useEffect(() => {
    if (fileResponse) {
      onTopicSelect(fileResponse);
    }
  }, [fileResponse, onTopicSelect]);

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto bg-white shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">What do you want to learn about <i>marketing</i> today?</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          {/* Input to enter a custom topic */}
          <Input
            placeholder="Enter any topic..."
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1"
          />
          {/* Button to select the custom topic */}
          <Button 
            onClick={() => customTopic && onTopicSelect(customTopic)}
            className="bg-accent hover:bg-accent/90"
          >
            Explore
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">...or upload a marketing file to get instant feedback</h2>
          <FileUpload onUploadComplete={handleUploadComplete} />

        <div className="pt-4">
          {/* Header for the suggested topics */}
          <p className="text-sm text-gray-600 mb-2">Popular Topics:</p>
          {/* List of suggested topics */}
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                onClick={() => onTopicSelect(topic)}
                className="hover:bg-primary/10"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

