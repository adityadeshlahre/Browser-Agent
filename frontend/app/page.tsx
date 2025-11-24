import axios from 'axios';
import { useState } from 'react';
import React from 'react';


export default function Home() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    sessionId: string;
    liveUrl: string;
  }>({
    sessionId: '',
    liveUrl: '',
  });
  const vmBase = process.env.NEXT_PUBLIC_VM_BASE || 'http://localhost:3001';

  const startAutomation = async () => {
    setRunning(true);
    try {
      const res = await axios.post(vmBase + '/api/airbnb');
      setResult(res.data);
      console.log('result', res.data);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert('Error starting automation: ' + errorMessage);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <SessionViewer debugURL={result?.liveUrl} />
        <div style={{ width: '40%' }}>
          <button onClick={startAutomation} disabled={running} style={{ padding: '12px 20px' }}>
            {running ? 'Starting...' : 'Start Airbnb automation (San Francisco)'}
          </button>
        </div>
      </div>
      {result && (
        <div style={{ marginTop: '24px' }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

type SessionViewerProps = {
  debugURL: string;
};

const SessionViewer: React.FC<SessionViewerProps> = ({ debugURL }) => {
  return (
    <div className="session-container">
      <div
        className="status-banner"
        style={{
          background: '#f0f0f0',
          padding: '10px',
          marginBottom: '10px',
          textAlign: 'center',
        }}
      >
        Automated session - Click inside to take control
      </div>

      <iframe
        src={`${debugURL}?interactive=true&showControls=true`}
        style={{
          width: '100%',
          height: '600px',
          border: 'none',
        }}
        title="Browser Session"
      />
    </div>
  );
};