import { useState, useRef, useEffect, fowardRef } from 'react';
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
  onConversationChange(conversation: string): void;
}

export const ChatInterface = ({ topic, onConversationChange }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: `Let's explore ${topic}! What would you like to know?`,
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Track AI typing state
  const scrollRef = useRef<HTMLDivElement>(null);  // scroll element created
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Add user message to chat
    // We clone the prev state to avoid direct mutation
    setMessages((prev) => [...prev, { content: newMessage, isUser: true }]);
    setNewMessage("");

    setIsTyping(true); // Show typing indicator
    console.log("AI is typing..."); // Debugging

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
      onConversationChange(data.reply);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false); // Hide typing indicator after response
      console.log("AI response received."); // Debugging
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg animate-fade-in">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Chat about {topic}</h3>
      </div>
      <ScrollArea ref={scrollRef} className="h-[400px] p-4">
        <div className="space-y-4">
              {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? "bg-blue-500 text-white text-right" // ✅ Align user messages right
                    : "bg-gray-100 text-gray-800 text-left"
                }`}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-gray-100 text-gray-800 animate-pulse">
                ZeitiosAI is typing...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
        
        
      <div className="p-4 border-t flex gap-2">
        <Input
          placeholder="Ask a question..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            onConversationChange(e.target.value);
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button 
          onClick={handleSend} 
          className="bg-primary hover:bg-primary/90 cursor-pointer"
          disabled={isTyping} // Disable button while AI is responding
        >
          {isTyping ? "..." : "Send"}
        </Button>
      </div>
    </Card>
  );
};
