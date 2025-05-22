import { useState, useRef, useEffect, forwardRef } from 'react';
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
  isFileUpload?: boolean;
  onConversationChange(conversation: string): void;
}

export const ChatInterface = ({ topic, isFileUpload = false, onConversationChange }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: isFileUpload
        ? `${topic}`
        : `Let's explore ${topic}! Start by asking a question about the topic.`,
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Track AI typing state
  const scrollRef = useRef<HTMLDivElement>(null);  // scroll element created
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    // Add user message to chat
    setMessages((prev) => [...prev, { content: newMessage, isUser: true }]);
    setNewMessage("");

    setIsTyping(true); // Show typing indicator

    try {
      // LOCAL MOCK RESPONSE - temporarily bypassing server
      // Comment this section out and uncomment the fetch call when API is fixed
      setTimeout(() => {
        const mockResponse = generateMockResponse(newMessage);
        setMessages((prev) => [...prev, { content: mockResponse, isUser: false }]);
        onConversationChange(mockResponse);
        setIsTyping(false);
      }, 1500); // Delay to simulate network request
      return;

      // Send message to server - UNCOMMENT WHEN API IS FIXED
      /*
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Add AI response to chat
        setMessages((prev) => [...prev, { content: data.reply, isUser: false }]);
        onConversationChange(data.reply);
      } else {
        // Add more detailed error message with instructions to fix
        const errorMsg = data.details || data.error || "Unknown error";
        console.error("API Error:", errorMsg);
        
        const apiKeyErrorMessage = `The OpenAI API key appears to be invalid or misconfigured. 

To fix this issue:
1. Make sure your .env file has a valid OpenAI API key
2. If using a project API key (starts with 'sk-proj-'), also add your OPENAI_PROJECT_ID to the .env file
3. Restart the server with 'npm run start'`;
        
        setMessages((prev) => [...prev, { 
          content: data.error?.includes("API key") ? apiKeyErrorMessage : "Sorry, I couldn't process your request. There may be an issue with the OpenAI API connection or key.", 
          isUser: false 
        }]);
      }
      */
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { 
        content: "Sorry, I couldn't connect to the server. Please check your connection and try again.", 
        isUser: false 
      }]);
      setIsTyping(false);
    }
  };

  // Mock response function to use locally
  const generateMockResponse = (message: string): string => {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi") || lowercaseMessage.includes("hey")) {
      return "Hello! I'm your marketing AI assistant. How can I help you with marketing concepts today?";
    }
    
    if (lowercaseMessage.includes("what is marketing")) {
      return "Marketing is the process of exploring, creating, and delivering value to meet the needs of a target market in terms of goods and services. It involves identifying customer needs and desires, determining which target markets the organization can serve best, and designing appropriate products, services, and programs to serve these markets. Marketing is about understanding people and their wants, and using strategic techniques to create lasting customer relationships.";
    }
    
    if (lowercaseMessage.includes("brand") || lowercaseMessage.includes("branding")) {
      return "Branding is the process of creating a distinct identity for a business in the minds of your target audience and consumers. A strong brand communicates what your organization stands for, why you exist, and how you differ from competitors. Effective branding includes consistent use of colors, logos, messaging, and values across all customer touchpoints. Strong brands build customer loyalty, command premium pricing, and provide a competitive advantage in the marketplace.";
    }
    
    if (lowercaseMessage.includes("digital marketing") || lowercaseMessage.includes("online marketing")) {
      return "Digital marketing encompasses all marketing efforts that use electronic devices or the internet. Businesses leverage digital channels such as search engines, social media, email, websites, and mobile apps to connect with current and prospective customers. Key components include SEO (Search Engine Optimization), content marketing, social media marketing, email marketing, and PPC (Pay-Per-Click) advertising. Digital marketing allows for precise targeting, real-time campaign adjustment, and detailed performance analytics.";
    }
    
    if (lowercaseMessage.includes("social media") || lowercaseMessage.includes("facebook") || lowercaseMessage.includes("instagram")) {
      return "Social media marketing involves creating and sharing content on social media platforms to achieve marketing and branding goals. It includes activities like posting text and image updates, videos, and other content that drives audience engagement. Social media marketing provides companies with ways to reach new customers, engage with existing customers, promote products/services, and build an online community around your brand. Key platforms include Facebook, Instagram, Twitter, LinkedIn, Pinterest, YouTube, and TikTok.";
    }
    
    if (lowercaseMessage.includes("seo") || lowercaseMessage.includes("search engine")) {
      return "SEO (Search Engine Optimization) is the practice of increasing both the quality and quantity of website traffic through organic search engine results. It involves understanding what people search for online, the actual terms they use, and the type of content they seek. SEO requires technical optimizations to your website structure, creating high-quality content that matches user intent, and building authority through backlinks. The goal is to improve your visibility when people search for products or services related to your business.";
    }
    
    // Default response for other marketing topics
    return "That's an interesting marketing question! As a marketing assistant, I can tell you that successful marketing strategies often combine multiple approaches including understanding your target audience, creating compelling value propositions, selecting appropriate channels, and measuring results to continually improve. Would you like more specific information about a particular aspect of marketing?";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg animate-fade-in">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{isFileUpload ? "Image Feedback" : `Chat about ${topic}`}</h3>
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
                    ? "bg-blue-500 text-white text-right" // Align user messages right
                    : "bg-gray-100 text-gray-800 text-left"
                }`}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ node, children, ...props }) => (
                      <h1 className="text-3xl font-bold mt-4 mb-2" {...props}>{children}</h1>
                    ),
                    h2: ({ node, children, ...props }) => (
                      <h2 className="text-2xl font-semibold mt-3 mb-1" {...props}>{children}</h2>
                    ),
                    h3: ({ node, children, ...props }) => (
                      <h3 className="text-xl font-medium mt-2 mb-1" {...props}>{children}</h3>
                    ),
                    p: ({ node, children, ...props }) => (
                      <p className="text-gray-800" {...props}>{children}</p>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>

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