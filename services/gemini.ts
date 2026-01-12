import { GoogleGenAI } from "@google/genai";

export const generateInsight = async (text: string, rating: number): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return "";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview as requested for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Accomplishment: "${text}"
      User Rating: ${rating}/10
      
      Provide a very short, warm, and encouraging 1-sentence comment about this accomplishment. Sound like a supportive friend. Do not use exclamation marks excessively.`,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};