import { useState } from 'react';
import './App.css';

// The interface defining the data structure remains the same.
interface OBCStatus {
  current_tick_name: string;
  is_connected: boolean;
  mission_progress_percent: number;
}

function App() {
  const [status, setStatus] = useState<OBCStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchStatus = () => {
    setIsLoading(true);
    setError(null);
    setStatus(null);

    fetch('/api/v1/obc/status')
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: OBCStatus) => {
        setStatus(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <h1>GCS Onboarding Tutorial</h1>
      <p>Click the button to send a request to the Go backend, which will proxy it to the C++ OBC.</p>
      
      <button onClick={fetchStatus} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get OBC Status'}
      </button>

      <div className="display-box">
        {isLoading && <p>Waiting for response...</p>}
        
        {error && (
            <pre className="error-text">{`Error:\n\n${error}`}</pre>
        )}

        {status && (
            <pre>{JSON.stringify(status, null, 2)}</pre>
        )}
        
        {!isLoading && !error && !status && <p>Response will appear here.</p>}
      </div>
    </div>
  );
}

export default App;