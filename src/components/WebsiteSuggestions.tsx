import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Website {
  title: string;
  url: string;
  description: string;
}

interface WebsiteSuggestionsProps {
  topic: string;
  conversation: any;
}

export const WebsiteSuggestions = ({ topic, conversation }: WebsiteSuggestionsProps) => {
  const [articles, setArticles] = useState<Website[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/exa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: topic, conversation: conversation }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data = await response.json();
        console.log(data);
        // Assuming the Exa API returns results in data.result.contents
        const formattedArticles = data.result.results.map((article: any) => ({
          title: article.title,
          url: article.url,
          description: article.text.substring(0, 150) + '...' // Short preview
        }));

        setArticles(formattedArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    if (topic) {
      fetchArticles();
    }
  }, [topic]);


  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-white shadow-lg animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Recommended Resources</h3>
      <div className="space-y-4">
        {articles.map((site, index) => (
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
