
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  content: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  topic: string;
}

export const ChatInterface = ({ topic }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: `Let's explore ${topic}! What would you like to know?`,
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      { content: newMessage, isUser: true },
      { content: `I'm processing your question about ${topic}...`, isUser: false },
    ]);
    setNewMessage("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg animate-fade-in">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Chat about {topic}</h3>
      </div>
      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          placeholder="Ask a question..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} className="bg-primary hover:bg-primary/90">
          Send
        </Button>
      </div>
    </Card>
  );
};
