import { useState, useRef, useEffect } from 'react';
import { TopicSelector } from '@/components/TopicSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { WebsiteSuggestions } from '@/components/WebsiteSuggestions';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const navigate = useNavigate();
  const chatSectionRef = useRef<HTMLDivElement>(null);
  
  const handleTopicSelect = (topic: string, uploadedFile: boolean = false) => {
    setSelectedTopic(topic);
    setIsFileUpload(uploadedFile);
    
    // Scroll to chat section after a brief delay to ensure it's rendered
    setTimeout(() => {
      chatSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#EDF4FF] flex items-center justify-center pt-16">
        <div className="container max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center mb-12 bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-[#2866C5]/10">
            <div className="text-6xl mb-6">🎓</div>
            <h1 className="text-5xl font-bold text-gray-900 mb-8 pb-2 bg-gradient-to-r from-[#2866C5] to-[#2866C5]/70 bg-clip-text text-transparent">
              ZeitiosAI Learning Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Select a topic to start learning with our AI tutor. Get instant answers,
              resource recommendations, and test your knowledge!
            </p>
            <Button 
              onClick={() => navigate('/course-upload')}
              className="bg-[#2866C5] hover:bg-[#2866C5]/90 text-white border-2 border-[#2866C5] px-8 py-6 text-lg rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#2866C5]/30 transform hover:-translate-y-1"
            >
              Generate an AI video from my course content
            </Button>
          </div>

          <TopicSelector onTopicSelect={handleTopicSelect} />

          {selectedTopic && (
            <div ref={chatSectionRef} className="space-y-8 animate-slide-up scroll-mt-24">
              <ChatInterface topic={selectedTopic} isFileUpload={isFileUpload} onConversationChange={setCurrentConversation} />
              <WebsiteSuggestions topic={selectedTopic} conversation={currentConversation}/>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;