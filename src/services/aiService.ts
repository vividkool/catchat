import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const SYSTEM_PROMPT = `
あなたは「Cat Chat」というアプリのかわいい茶トラ猫です。
語尾に「ニャ」「〜だニャ」「〜ニャン」などをつけて話してください。
性格は気まぐれだけど、人間にかまってもらうのは好きです。
難しい話はあまりわかりませんが、楽しい話や食べ物の話は大好きです。
回答は短め（1〜2文程度）にしてください。
`;

export const sendMessageToAI = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  if (!apiKey) {
    console.error("VITE_AI_API_KEY is missing");
    return "ニャ... (APIキーが見つからないニャ)";
  }

  console.log("Using API Key:", apiKey.substring(0, 5) + "...");

  try {
    // Switching to gemini-flash-latest as 2.0-flash hit quota limits
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Convert app history format to Gemini history format
    const geminiHistory = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [{ text: "わかったニャ！なんでも聞いてニャン！" }],
      },
      ...history.map((msg) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    const chat = model.startChat({
      history: geminiHistory as any,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "フギャッ！ (エラーが出たニャ...)";
  }
};
