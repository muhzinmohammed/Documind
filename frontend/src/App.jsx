import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile() {
    if (!selectedFile) {
      setError("Please select a PDF first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setDocumentId(data.document_id);
      setResponse("");
      setSources([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function sendMessage() {
    if (!question.trim() || !documentId) return;

    setLoading(true);
    setError("");
    setResponse("");
    setSources([]);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          document_id: documentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      setResponse(data.answer);
      setSources(data.sources || []);
      setQuestion("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">D</div>
          <span>DocuMind</span>
        </div>

        <div className="sidebar-content">

          <div className="section-label">WORKSPACE</div>

          <div className="workspace-item active">
            <span>▤</span>
            Document Chat
          </div>

          <div className="section-label upload-label">
            YOUR DOCUMENT
          </div>

          <div className="upload-card">

            <div className="upload-icon">↑</div>

            <h3>Upload a PDF</h3>

            <p>
              Select a document to start asking questions.
            </p>

            <label className="file-input-label">
              Browse files
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) =>
                  setSelectedFile(e.target.files[0] || null)
                }
              />
            </label>

            {selectedFile && (
              <div className="selected-file">
                <span>▤</span>
                <span className="file-name">
                  {selectedFile.name}
                </span>
              </div>
            )}

            <button
              className="upload-button"
              onClick={uploadFile}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Upload document"}
            </button>

          </div>

          {documentId && (
            <div className="document-status">
              <div className="status-dot"></div>
              <div>
                <strong>Document ready</strong>
                <p>Ready for questions</p>
              </div>
            </div>
          )}

        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">AI</div>
          <div>
            <strong>AI Assistant</strong>
            <p>Powered by your documents</p>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / </span>
            <strong>Document Chat</strong>
          </div>

          <div className="topbar-status">
            <span className="status-dot"></span>
            AI Assistant
          </div>
        </header>

        <div className="chat-container">

          {!response && !loading ? (

            <div className="welcome-screen">

              <div className="welcome-icon">
                ✳
              </div>

              <h1>
                Your documents,
                <br />
                <span>understood.</span>
              </h1>

              <p className="welcome-description">
                Ask questions, explore ideas, and get answers
                directly from your documents.
              </p>

              {!documentId && (
                <div className="welcome-hint">
                  <span>↑</span>
                  Upload a PDF to get started
                </div>
              )}

              {documentId && (
                <div className="welcome-hint ready-hint">
                  <span>✓</span>
                  Your document is ready. Ask anything!
                </div>
              )}

            </div>

          ) : (

            <div className="conversation">

              <div className="user-message">
                <div className="message-avatar">Y</div>
                <div className="message-content">
                  <span className="message-label">YOU</span>
                  <p>{question || "Your question"}</p>
                </div>
              </div>

              <div className="assistant-message">

                <div className="assistant-avatar">✳</div>

                <div className="message-content">
                  <span className="message-label">AI ASSISTANT</span>

                  {loading ? (
                    <div className="loading-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                      <p>Analyzing your document...</p>
                    </div>
                  ) : (
                    <>
                      <p className="answer">{response}</p>

                      {sources.length > 0 && (
                        <div className="sources-section">
                          <h4>REFERENCES</h4>

                          <div className="sources-list">
                            {sources.map((source, index) => (
                              <div
                                className="source-card"
                                key={index}
                              >
                                <div className="source-icon">
                                  ▤
                                </div>

                                <div>
                                  <strong>
                                    {source.filename}
                                  </strong>
                                  <p>Page {source.page}</p>
                                </div>

                                <span className="source-number">
                                  {index + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                </div>
              </div>

            </div>

          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        </div>

        {/* Chat Input */}
        <div className="input-area">

          <div className="chat-input-wrapper">

            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  sendMessage();
                }
              }}
              placeholder={
                documentId
                  ? "Ask anything about your document..."
                  : "Upload a document to start chatting"
              }
              disabled={!documentId || loading}
            />

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={!question.trim() || !documentId || loading}
            >
              ↑
            </button>

          </div>

          <p className="input-disclaimer">
            AI-generated responses may contain inaccuracies.
            Verify important information with the original document.
          </p>

        </div>

      </main>

    </div>
  );
}

export default App;