import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function detectCropDisease(base64Image: string, mimeType: string) {
  const prompt = `Act as a Ugandan Agronomist. Analyze this image of a crop. 
  Identify if the plant has a disease common in East Africa (specifically Uganda).
  If you find a disease, provide details. If the plant looks healthy, state that.
  Return the response in a structured JSON format.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      isDiseased: { type: Type.BOOLEAN, description: "Whether the crop appears to have a disease." },
      cropType: { type: Type.STRING, description: "The type of crop identified (e.g., Maize, Coffee, Banana, Beans)." },
      diseaseName: { type: Type.STRING, description: "The name of the detected disease." },
      cause: { type: Type.STRING, description: "The cause of the disease." },
      treatment: { type: Type.STRING, description: "Recommended treatment or prevention localized to Ugandan farming practices." },
      confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1." }
    },
    required: ["isDiseased", "cropType", "confidence"]
  };

  const model = "gemini-3-flash-preview";
  
  const result = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema
    }
  });

  return JSON.parse(result.text || "{}");
}

export async function getMarketplaceSuggestions(cropType: string, quantity: string, location: string) {
  const prompt = `Act as a Ugandan agricultural market analyst. 
  Based on the crop type: "${cropType}", quantity: "${quantity}", and location: "${location}" in Uganda, 
  suggest a fair market price (in UGX), provide a sharp marketing description for a listing, 
  and give a brief market insight (e.g., current demand trend).
  Return as JSON.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      suggestedPrice: { type: Type.NUMBER, description: "Suggested price in UGX (Ugandan Shillings)." },
      suggestedDescription: { type: Type.STRING, description: "A catchy description for the marketplace listing." },
      marketInsight: { type: Type.STRING, description: "Brief insight about current market localized to Uganda." }
    },
    required: ["suggestedPrice", "suggestedDescription", "marketInsight"]
  };

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema
    }
  });

  return JSON.parse(result.text || "{}");
}

export async function extractHarvestInfo(base64Image: string, mimeType: string) {
  const prompt = `Act as a Ugandan agricultural marketplace assistant. 
  Analyze this image of a harvest.
  Extract:
  1. Crop Type (Maize, Coffee, Banana, Beans, etc.)
  2. Estimated Quantity (e.g. "50kg", "5 Bunches")
  3. Quality/Grade (e.g. "Grade A", "Premium", "Fair")
  4. Suggested Market Description based on the quality.
  Return as JSON.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      cropType: { type: Type.STRING },
      quantity: { type: Type.STRING },
      quality: { type: Type.STRING },
      suggestedDescription: { type: Type.STRING }
    },
    required: ["cropType", "quantity", "quality", "suggestedDescription"]
  };

  const model = "gemini-3-flash-preview";
  
  const result = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema
    }
  });

  return JSON.parse(result.text || "{}");
}

export async function chatWithAssistant(message: string, history: { role: "user" | "model", parts: { text: string }[] }[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are AgriSmart Uganda Assistant, a helpful agronomist specializing in Ugandan agriculture. Provide practical, localized advice for farmers. Use simple language. You can respond in English, Luganda, or Swahili if requested."
    },
    history
  });

  const result = await chat.sendMessage({ message });
  return result.text;
}
