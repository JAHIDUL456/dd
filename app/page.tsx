"use client";

import { useState, useEffect, useRef } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type Message = {
  role: "user" | "assistant";
  content: string;
  hasAnimated?: boolean;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Tell me about awards 🏆",
    "What is your current job? 💼",
    "Share some personal details 👤",
    "What are your future plans? 🚀",
  ];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (customMessage?: string) => {
    const text = customMessage || input;
    if (!text.trim()) return;
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
        hasAnimated: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Error fetching response.",
          hasAnimated: true,
        },
      ]);
      setIsLoading(false);
    }
  };

  // Typing animation
  function TypingText({ text, onDone }: { text: string; onDone: () => void }) {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          onDone();
        }
      }, 15);
      return () => clearInterval(interval);
    }, [text, onDone]);

    return <p className="whitespace-pre-wrap leading-relaxed">{displayed}</p>;
  }

  return (
    <main
      className={`flex flex-col h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`p-4 flex justify-between items-center border-b ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-200 border-gray-300"
        }`}
      >
        <h1 className={`text-lg md:text-xl font-bold ${orbitron.className}`}>
          Jahid&apos;s{" "}
          <span className={darkMode ? "text-green-300" : "text-blue-600"}>
            🤖InsightAI
          </span>
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-full p-2 text-2xl hover:scale-110 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.map((m, idx) => {
          const isLastAssistant =
            m.role === "assistant" && idx === messages.length - 1 && !m.hasAnimated;

          return (
            <div
              key={idx}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-2 md:px-5 md:py-3 text-sm md:text-base rounded-2xl shadow ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : darkMode
                    ? "bg-gray-700 text-gray-100 rounded-bl-sm"
                    : "bg-white text-gray-900 rounded-bl-sm"
                }`}
              >
                {isLastAssistant ? (
                  <TypingText
                    text={m.content}
                    onDone={() => {
                      setMessages((prev) => {
                        const copy = [...prev];
                        copy[idx].hasAnimated = true;
                        return copy;
                      });
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading bubbles */}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className={`px-4 py-2 rounded-lg flex space-x-2 ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-900"
              }`}
            >
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions ABOVE input */}
      {messages.length === 0 && (
        <div
          className={`max-w-4xl mx-auto flex flex-wrap gap-2 px-3 pb-2 justify-center`}
        >
          {suggestions.map((sugg, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(sugg)}
              className={`px-4 py-2 text-sm md:text-base rounded-xl shadow-md border transition transform hover:scale-105 ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-green-300 hover:bg-gray-700"
                  : "bg-white border-gray-300 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {sugg}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <footer
        className={`p-3 md:p-4 border-t sticky bottom-0 ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-200 border-gray-300"
        }`}
      >
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          <input
            className={`flex-1 p-4 md:p-3 rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border border-gray-600 text-white"
                : "bg-white border border-gray-400 text-gray-900"
            }`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about Jahidul..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={() => sendMessage()}
            className="px-3 py-4 md:px-5 md:py-3 bg-blue-600 rounded-4xl md:rounded-2xl text-white text-sm md:text-base hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </footer>
    </main>
  );
}