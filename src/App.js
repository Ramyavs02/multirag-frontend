import React, { useState } from "react";
import "./App.css";


const API_URL = "https://multiragbackened-cgf3c2cpfga5h3bs.canadaeast-01.azurewebsites.net";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const getIntentColor = (intent) => {
    if (intent === "products") return "#2563eb";
    if (intent === "policies") return "#7c3aed";
    if (intent === "orders") return "#16a34a";
    return "#6b7280";
  };

  const getLatencyColor = (latency) => {
    if (latency < 1000) return "green";
    if (latency < 2000) return "orange";
    return "red";
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;

    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setQuestion("");

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
      });

      const data = await res.json();

      const assistantMessage = {
        role: "assistant",
        content: data,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: { answer: "⚠️ Unable to connect to backend." },
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="container">
  <h1 className="title">IntelliRAG AI</h1>
  <p className="subtitle">Enterprise Knowledge Intelligence</p>

  <div className="chat-window">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={msg.role === "user" ? "user-bubble" : "assistant-bubble"}
      >
            {msg.role === "user" ? (
              msg.content
            ) : (
              <>
                <div className="answer">{msg.content.answer}</div>

                {msg.content.intents && (
                  <div className="badges">
                    {msg.content.intents.map((intent, i) => (
                      <span
                        key={i}
                        className="badge"
                        style={{
                          backgroundColor: getIntentColor(intent),
                        }}
                      >
                        {intent}
                      </span>
                    ))}
                  </div>
                )}

                {msg.content.latency_ms && (
                  <div
                    className="latency"
                    style={{
                      color: getLatencyColor(msg.content.latency_ms),
                    }}
                  >
                    ⚡ {msg.content.latency_ms} ms
                  </div>
                )}

                {msg.content.sources &&
                  msg.content.sources.length > 0 && (
                    <details>
                      <summary>Sources</summary>
                      <ul>
                        {msg.content.sources.map((src, i) => (
                          <li key={i}>{src}</li>
                        ))}
                      </ul>
                    </details>
                  )}
              </>
            )}
          </div>
        ))}

        {loading && <div className="assistant-bubble">Thinking...</div>}
      </div>

      <div className="input-section">
        <textarea
          rows="2"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button onClick={handleSubmit} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
