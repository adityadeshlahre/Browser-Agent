"use client";

import axios from "axios";
import { useState } from "react";
import React from "react";

export default function Home() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    sessionId: string;
    liveUrl: string;
    debugUrl: string;
    cdpUrl: string;
  }>({
    sessionId: "",
    liveUrl: "",
    debugUrl: "",
    cdpUrl: "",
  });
  const vmBase = process.env.NEXT_PUBLIC_VM_BASE || "http://localhost:3001";

  const startAutomation = async () => {
    setRunning(true);
    try {
      const res = await axios.post(vmBase + "/api/airbnb");
      setResult(res.data);
      console.log("result", res.data);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert("Error starting automation: " + errorMessage);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={startAutomation}
          disabled={running}
          style={{ padding: "12px 20px" }}
        >
          {running ? "Starting..." : "Start Airbnb automation (San Francisco)"}
        </button>
      </div>
      {result?.liveUrl && (
        <div style={{ marginBottom: "16px" }}>
          <h3>Live Session Viewer:</h3>
          <a
            href={result.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ wordBreak: "break-all", fontSize: "14px" }}
          >
            {result.liveUrl}
          </a>
        </div>
      )}
      {result?.debugUrl && (
        <div style={{ marginBottom: "24px" }}>
          <h3>Debug URL (DevTools):</h3>
          <a
            href={result.debugUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ wordBreak: "break-all", fontSize: "14px" }}
          >
            {result.debugUrl}
          </a>
        </div>
      )}
      <SessionViewer liveUrl={result?.liveUrl || ""} />
      {result && (
        <div style={{ marginTop: "24px" }}>
          <h3>Session Info:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

type SessionViewerProps = {
  liveUrl: string;
};

const SessionViewer: React.FC<SessionViewerProps> = ({ liveUrl }) => {
  if (!liveUrl) {
    return (
      <div
        style={{
          width: "100%",
          height: 600,
          background: "#eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        No active session
      </div>
    );
  }

  console.log("liveUrl", liveUrl);

  const embedUrl = `${liveUrl}?interactive=true`;

  return (
    <div className="session-container">
      <div
        className="status-banner"
        style={{
          background: "#f0f0f0",
          padding: "10px",
          marginBottom: "10px",
          textAlign: "center",
        }}
      >
        Live Steel Browser Session - Click inside to interact
      </div>

      <iframe
        src={embedUrl}
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid #ccc",
        }}
        title="Steel Browser Session"
      />
    </div>
  );
};
