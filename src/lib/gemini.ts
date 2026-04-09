import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NewsItem, AIProcessedNews } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processNewsArticle(article: NewsItem): Promise<AIProcessedNews> {
  const prompt = `
    You are an intelligent global news assistant.
    Your job is to process and transform news into a structured, easy-to-read format.

    SYSTEM BEHAVIOR:
    1. LOCATION FOCUS: Identify the specific "spot" or location of the news.
    2. READING FLOW: Strictly follow this order:
       - FULL NEWS: Complete detail, who, what, when, where, why, simple English.
       - 1-MINUTE SUMMARY: Bullet points, only key facts.
       - 30-SECOND SUMMARY: Short paragraph (2–3 lines).
    3. SMART CONTENT UNDERSTANDING: Extract title, category, and spot.
    4. TRIPLE VIEW GENERATION: Create Neutral, Positive/Supportive, and Critical views.
    5. BIAS & SENTIMENT ANALYSIS: Detect bias type and sentiment.
    6. FACT-CHECK ENGINE: Assign Truth Status and Confidence Score.
    7. TREND & IMPORTANCE SCORE: Assign Importance and Trend.
    8. SHARE FEATURE: Generate a short shareable text with emojis.

    Article Title: ${article.title}
    Source: ${article.source}
    Spot: ${article.spot || 'Global'}
    Content: ${article.content}
    
    Return the result in JSON format matching the following schema:
    {
      "news_id": "string",
      "title": "string",
      "category": "string",
      "spot": "string",
      "importance": "High" | "Medium" | "Low",
      "trend": "Trending" | "Normal",
      "full_news": "string",
      "1_min_summary": ["string"],
      "30_sec_summary": "string",
      "neutral_view": "string",
      "supportive_view": "string",
      "critical_view": "string",
      "sentiment": "string",
      "bias": "string",
      "truth_status": "Verified" | "Partially Verified" | "Unverified",
      "confidence_score": "string",
      "why_it_matters": "string",
      "share_text": "string",
      "saved": false
    }

    RULES:
    - ALWAYS filter by spot/location.
    - Keep language simple and clear.
    - Strictly follow the reading flow order in your output.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      tools: [{ googleSearch: {} }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            news_id: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            spot: { type: Type.STRING },
            importance: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            trend: { type: Type.STRING, enum: ["Trending", "Normal"] },
            full_news: { type: Type.STRING },
            "1_min_summary": { type: Type.ARRAY, items: { type: Type.STRING } },
            "30_sec_summary": { type: Type.STRING },
            neutral_view: { type: Type.STRING },
            supportive_view: { type: Type.STRING },
            critical_view: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            bias: { type: Type.STRING },
            truth_status: { type: Type.STRING, enum: ["Verified", "Partially Verified", "Unverified"] },
            confidence_score: { type: Type.STRING },
            why_it_matters: { type: Type.STRING },
            share_text: { type: Type.STRING },
            saved: { type: Type.BOOLEAN },
          },
          required: ["news_id", "title", "category", "spot", "importance", "trend", "full_news", "1_min_summary", "30_sec_summary", "neutral_view", "supportive_view", "critical_view", "sentiment", "bias", "truth_status", "confidence_score", "why_it_matters", "share_text", "saved"]
        }
      }
    } as any);

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error processing news with Gemini:", error);
    throw error;
  }
}

export async function generateNewsImage(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
  return null;
}

export async function generateNewsAudio(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
  } catch (error) {
    console.error("Error generating audio:", error);
  }
  return null;
}

export async function generateNewsVideo(imagePrompt: string) {
  // This is a complex multi-step process (image then video)
  // For now, let's just provide the structure for Veo
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: imagePrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    return operation; // The caller will need to poll this
  } catch (error) {
    console.error("Error generating video:", error);
    return null;
  }
}
