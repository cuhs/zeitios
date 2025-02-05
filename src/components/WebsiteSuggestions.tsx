import { Card } from "@/components/ui/card";

interface Website {
  title: string;
  url: string;
  description: string;
}

interface WebsiteSuggestionsProps {
  topic: string;
}

export const WebsiteSuggestions = ({ topic }: WebsiteSuggestionsProps) => {
  // In a real app, these would be dynamically generated based on the topic
  const websites: Website[] = [
    {
      title: "Topic Overview",
      url: "#",
      description: `Comprehensive introduction to ${topic}`,
    },
    {
      title: "Deep Dive Resources",
      url: "#",
      description: `Advanced materials about ${topic}`,
    },
    {
      title: "Interactive Learning",
      url: "#",
      description: `Practice exercises for ${topic}`,
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-white shadow-lg animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Recommended Resources</h3>
      <div className="space-y-4">
        {websites.map((site, index) => (
          <a
            key={index}
            href={site.url}
            className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <h4 className="text-primary font-medium">{site.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{site.description}</p>
          </a>
        ))}
      </div>
    </Card>
  );
};