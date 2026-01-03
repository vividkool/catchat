import { useState, useEffect } from "react";
import WalkingCat from "./components/WalkingCat";
import ChatBubble from "./components/ChatBubble";
import { sendMessageToAI } from "./services/aiService";
import { saveMessage, getRecentMessages } from "./services/firebase";
import "./App.css";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "model"; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await getRecentMessages(10);
      if (history.length > 0) {
        const mappedHistory = history.map((msg) => ({
          role: msg.sender === "cat" ? ("model" as const) : ("user" as const),
          content: msg.text,
        }));
        setMessages(mappedHistory);
      } else {
        setMessages([{ role: "model", content: "ニャー？ (なにか用？)" }]);
      }
    };
    loadHistory();
  }, []);

  const handleCatClick = () => {
    setIsChatOpen(true);
    if (messages.length === 0) {
      setMessages([{ role: "model", content: "ニャー？ (なにか用？)" }]);
    }
  };

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg = { role: "user" as const, content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Save to Firestore (fire and forget)
    saveMessage(text, "user");

    try {
      // Pass messages (context) to AI
      const response = await sendMessageToAI(text, messages);

      const aiMsg = { role: "model" as const, content: response };
      setMessages((prev) => [...prev, aiMsg]);
      saveMessage(response, "cat");
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "ニャ... (なんか調子悪いみたい)" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-title">
        <h1>CAT CHAT</h1>
        <p>by GEMINI</p>
      </div>
      <WalkingCat onClick={handleCatClick} />
      {isChatOpen && (
        <ChatBubble
          messages={messages}
          onSendMessage={handleSendMessage}
          onClose={() => setIsChatOpen(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default App;
