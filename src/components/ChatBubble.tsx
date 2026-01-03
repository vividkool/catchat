import React, { useState, useEffect, useRef } from "react";
import "./ChatBubble.css";

interface ChatBubbleProps {
  messages: { role: "user" | "model"; content: string }[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  messages,
  onSendMessage,
  onClose,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="chat-bubble-container">
      <div className="chat-header">
        <span>Cat Chat</span>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="message model loading">...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="猫に話しかける..."
          autoFocus
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBubble;
