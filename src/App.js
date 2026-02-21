import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const API_URL =
  "https://multiragbackened-cgf3c2cpfga5h3bs.canadaeast-01.azurewebsites.net";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark");
  };

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
    if (!question.trim() || loading) return;

    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setQuestion("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: {
            answer:
              "⚠️ Unable to connect to backend. Please check server status.",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>IntelliRAG</h2>
        <ul>
          <li>Chat</li>
          <li>Analytics</li>
          <li>Knowledge Base</li>
          <li>Settings</li>
        </ul>
        <button className="dark-toggle" onClick={toggleDarkMode}>
          Toggle Dark
        </button>
      </div>

      <div className="main-content">
        <h1 className="title">IntelliRAG AI</h1>
        <p className="subtitle">Enterprise Knowledge Intelligence</p>

        <div className="chat-window">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.role === "user"
                  ? "user-bubble"
                  : "assistant-bubble"
              }
            >
              {msg.role === "user" ? (
                msg.content
              ) : (
                <>
                  <div className="answer">
                    {msg.content?.answer}
                  </div>

                  {msg.content?.intents && (
                    <div className="badges">
                      {msg.content.intents.map((intent, i) => (
                        <span
                          key={i}
                          className="badge"
                          style={{
                            backgroundColor:
                              getIntentColor(intent),
                          }}
                        >
                          {intent}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.content?.latency_ms && (
                    <div
                      className="latency"
                      style={{
                        color: getLatencyColor(
                          msg.content.latency_ms
                        ),
                      }}
                    >
                      ⚡ {msg.content.latency_ms} ms
                    </div>
                  )}

                  {msg.content?.sources?.length > 0 && (
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

          {loading && (
            <div className="assistant-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={chatEndRef} />
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
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
