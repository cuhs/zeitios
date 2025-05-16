import { useState } from 'react';
import { createAudioFileFromText } from '../lib/text_to_speech_file';

interface TextToSpeechPlayerProps {
  text: string;
}

export function TextToSpeechPlayer({ text }: TextToSpeechPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlay = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await createAudioFileFromText(text);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handlePlay}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating Audio...' : 'Play Audio'}
      </button>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {audioUrl && (
        <audio controls className="w-full max-w-md">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
} 