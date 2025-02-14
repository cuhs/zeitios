import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown"; 

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

  // handlesend updated to work with server.ts hopefully
  const handleSend = async () => {
    if (!newMessage.trim()) return;
  
    // Add user message to chat
    setMessages((prev) => [...prev, { content: newMessage, isUser: true }]);
  
    try {
      // Send message to server
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      });
  
      const data = await response.json();
  
      // Add AI response to chat
      setMessages((prev) => [...prev, { content: data.reply, isUser: false }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  
    setNewMessage(""); // Clear input field
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
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {/* Here we use ReactMarkdown and apply Tailwind classes for better integration */}
                <ReactMarkdown className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl 
                  prose-headings:font-semibold prose-headings:text-gray-800 
                  prose-p:text-gray-700 prose-ul:list-disc prose-ul:pl-5 
                  prose-strong:font-bold prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic">
                  {message.content}
                </ReactMarkdown>
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
