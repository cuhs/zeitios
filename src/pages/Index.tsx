import { useState, useRef, useEffect } from 'react';
import { TopicSelector } from '@/components/TopicSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { WebsiteSuggestions } from '@/components/WebsiteSuggestions';

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  
  const handleTopicSelect = (topic: string, uploadedFile: boolean = false) => {
    setSelectedTopic(topic);
    setIsFileUpload(uploadedFile);
  };

  useEffect(() => {
    if (selectedTopic && chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); 
    }
  }, [selectedTopic]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="relative mb-16">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-9xl font-black text-gray-50 select-none">
            LEARN
          </div>
          <div className="text-center relative z-10">
            <h1 className="text-4xl font-black text-black mb-6 tracking-tight">
              ZeitiosAI Learning Assistant
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select a topic to start learning with our AI tutor. Get instant answers,
              resource recommendations, and test your knowledge.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-12 border-b border-gray-100 pb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">Select a Topic</h2>
              <p className="text-gray-600">Choose a subject you'd like to explore with our AI</p>
            </div>
            <TopicSelector onTopicSelect={handleTopicSelect} />
          </div>

          {selectedTopic && (
            <div className="space-y-10 animate-fade-in">
              <div className="p-4 bg-gray-50 border border-gray-100 mb-8 flex justify-between items-center">
                <h3 className="text-lg font-bold text-black">{selectedTopic}</h3>
                <button 
                  onClick={() => setSelectedTopic(null)}
                  className="text-sm text-gray-500 hover:text-black transition-colors underline"
                >
                  Change Topic
                </button>
              </div>
              
              <div ref={chatRef}>
                <ChatInterface 
                  topic={selectedTopic} 
                  isFileUpload={isFileUpload} 
                  onConversationChange={setCurrentConversation} 
                />
              </div>
              
              <WebsiteSuggestions 
                topic={selectedTopic} 
                conversation={currentConversation}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;