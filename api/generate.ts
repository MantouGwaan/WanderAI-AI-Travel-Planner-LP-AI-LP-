import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  const { type, systemInstruction, prompt, history, message, responseSchema } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey });

    if (type === "initial") {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        },
      });
      return res.status(200).json({ text: response.text });
    } else if (type === "chat") {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        },
        history,
      });

      const response = await chat.sendMessage({ message });
      return res.status(200).json({ text: response.text });
    } else {
      return res.status(400).json({ error: "Invalid request type" });
    }
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
