import { GoogleGenAI } from "@google/genai";
import { Signal } from "../types";

const getClient = () => {
    // Check if API KEY is available
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key is missing. AI features will be disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const analyzeSignal = async (signal: Signal): Promise<string> => {
    const client = getClient();
    if (!client) return "AI Analysis unavailable without API Key.";

    try {
        const prompt = `
        You are a senior financial analyst. Provide a concise, 2-sentence rationale for a ${signal.type} trade on ${signal.asset}. 
        Entry: ${signal.entryPrice}, Stop Loss: ${signal.stopLoss}, Take Profit: ${signal.takeProfit1}.
        Focus on technical reasoning (e.g., support/resistance, trend) or macro sentiment suitable for a beginner trader.
        Do not give financial advice, just the educational rationale.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Analysis could not be generated.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "AI is currently offline. Please try again later.";
    }
};

export const generateMarketUpdate = async (): Promise<string> => {
    const client = getClient();
    if (!client) return "Market update unavailable.";

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Give a very short, futuristic style 'Market Pulse' update (max 30 words) about global markets (Crypto/Forex) suitable for a trading app notification.",
        });
        return response.text || "Market stable.";
    } catch (error) {
        return "Market data unavailable.";
    }
}
