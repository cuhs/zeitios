import * as ElevenLabs from 'elevenlabs/api';
import { ElevenLabsClient } from 'elevenlabs/wrapper';

interface TextToSpeechParams {
  text: string;
  voiceId?: string;
  modelId?: string;
  onProgress?: (progress: number) => void;
}

// Default voice and model IDs
const DEFAULT_VOICE_ID = 'Adam'; 
const DEFAULT_MODEL_ID = 'eleven_monolingual_v1'; 

// Get API key from environment or directly (for development)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

// Create a new ElevenLabs client
const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export async function generateSpeech({ 
  text, 
  voiceId = DEFAULT_VOICE_ID, 
  modelId = DEFAULT_MODEL_ID,
  onProgress
}: TextToSpeechParams): Promise<Blob> {
  try {
    if (!onProgress) {
      // Generate audio without progress tracking
      const audioStream = await client.generate({
        text,
        voice: voiceId,
        model_id: modelId,
      });
      
      // Convert readable stream to blob
      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk as Uint8Array);
      }
      
      return new Blob(chunks, { type: 'audio/mpeg' });
    }
    
    // Handle streaming with progress
    const audioStream = await client.generate({
      text,
      voice: voiceId,
      model_id: modelId,
      stream: true,
    });
    
    // Collect chunks and track progress
    const chunks: Uint8Array[] = [];
    let progress = 0;
    
    for await (const chunk of audioStream) {
      chunks.push(chunk as Uint8Array);
      progress += 5;
      onProgress(Math.min(progress, 95)); // Cap at 95% until fully complete
    }
    
    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    onProgress(100); // Set progress to 100% when complete
    return blob;
    
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getAvailableVoices(): Promise<ElevenLabs.Voice[]> {
  try {
    // Create a custom client for the voices API
    const response = await client.voices.getAll();
    return response.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
} 