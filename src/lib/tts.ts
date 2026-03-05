import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSpeech(text: string): Promise<string | null> {
  if (!text || text.trim() === "") return null;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error("TTS Error: No candidates in response", response);
      return null;
    }

    const base64Audio = response.candidates[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.error("TTS Error: No audio data in response", response.candidates[0]);
      return null;
    }

    return base64Audio;
  } catch (error) {
    console.error("TTS Error during API call:", error);
    return null;
  }
}
