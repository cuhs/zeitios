import { useState } from 'react';
import { TopicSelector } from '@/components/TopicSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { WebsiteSuggestions } from '@/components/WebsiteSuggestions';

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Learning Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a topic to start learning with our AI tutor. Get instant answers,
            resource recommendations, and test your knowledge.
          </p>
        </div>

        <TopicSelector onTopicSelect={setSelectedTopic} />

        {selectedTopic && (
          <div className="space-y-8 animate-slide-up">
            <ChatInterface topic={selectedTopic} onConversationChange={setCurrentConversation}/>
            <WebsiteSuggestions topic={selectedTopic} conversation={currentConversation}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;