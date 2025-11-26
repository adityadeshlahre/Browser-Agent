"use client";

import axios from "axios";
import { useState } from "react";
import React from "react";

export default function Home() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    sessionId: string;
    liveUrl: string;
    debugUrl: string;
    cdpUrl: string;
  } | null>(null);

  const vmBase = process.env.NEXT_PUBLIC_VM_BASE;

  if (!vmBase) {
    throw new Error('NEXT_PUBLIC_VM_BASE environment variable is required');
  }

  const startAutomation = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await axios.post(vmBase + "/api/airbnb");
      setResult(res.data);
      console.log("result", res.data);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
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
          style={{ padding: "12px 20px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {running ? "Starting..." : "Start Airbnb automation (San Francisco)"}
        </button>
      </div>
      {error && (
        <div style={{ color: '#dc2626', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '4px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <SessionViewer liveUrl={result?.debugUrl || ""} />
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
          height: "600px",
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
    <div style={{ width: "100%", height: "600px" }}>
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
