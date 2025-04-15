import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function main() {
  // Read audio file
  const audioPath = './MP3/1.pcm'; // Change this to your audio file path
  const audioBuffer = await fs.readFile(audioPath);
  const audioBase64 = audioBuffer.toString('base64');
  const audioWmBase64 = audioBuffer.toString('base64'); // Assuming you want to use the same audio for watermarking
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash-lite', // Make sure this model supports audio input
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'audio/pcm;rate=16000', // Use the correct MIME type for your audio
              data: audioWmBase64
            }
          },
          {
            text: '' // Optional text prompt alongside audio
          }
        ]
      }
    ]
  });
  
  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

main().catch((error) => {
  console.error('Error:', error);
});