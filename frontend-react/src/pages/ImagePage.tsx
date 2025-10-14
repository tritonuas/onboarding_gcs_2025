import { useState } from "react";

export default function ImagePage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tick, setTick] = useState<string | null>(null);
  const [tickError, setTickError] = useState<string | null>(null);
  const [isTickLoading, setIsTickLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<string | null>(null);

  const fetchImage = () => {
    setIsLoading(true);
    setError(null);
    setImageData(null);

    fetch("/api/v1/obc/capture")
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(
            errData.error || `HTTP error! Status: ${response.status}`
          );
        }
        return response.text();
      })
      .then((data) => {
        setImageData(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchTick = () => {
    setIsTickLoading(true);
    setTickError(null);
    setTick(null);

    const bust = Date.now();
    fetch(`/api/v1/obc/tick?_=${bust}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          // try parse JSON error from proxy, else use status text
          try {
            const errData = await response.json();
            throw new Error(
              errData.error || `HTTP error! Status: ${response.status}`
            );
          } catch (_) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        }
        return response.text();
      })
      .then((text) => {
        setTick(text);
      })
      .catch((err) => {
        setTickError(err.message);
      })
      .finally(() => {
        setIsTickLoading(false);
      });
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h2>OBC Image Capturd</h2>
      <div>
        <button onClick={fetchImage} disabled={isLoading}>
          {isLoading ? "Loading..." : "Get OBC Image"}
        </button>
        <button
          onClick={fetchTick}
          disabled={isTickLoading}
          style={{ marginLeft: "10px" }}
        >
          {isTickLoading ? "Loading..." : "Get Current Tick"}
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          minHeight: "100px",
        }}
      >
        <h3>Response from OBC:</h3>
        {isLoading && <p>Fetching image data from OBC via Go proxy...</p>}

        {error && (
          <div style={{ color: "red" }}>
            <h4>Error:</h4>
            <pre>{error}</pre>
            <p>Is the C++ OBCpp server running on port 5010?</p>
          </div>
        )}

        {imageData && (
          <div style={{ color: "green" }}>
            <h4>Success!</h4>
            <img src={`data:image/png;base64,${imageData}`} />
          </div>
        )}

        {!isLoading && !error && !imageData && (
          <p>Click the button to fetch the OBC image data.</p>
        )}

        <hr style={{ margin: "16px 0" }} />
        <h3>Current Tick:</h3>
        {isTickLoading && <p>Fetching tick from OBC...</p>}

        {tickError && (
          <div style={{ color: "red" }}>
            <h4>Error:</h4>
            <pre>{tickError}</pre>
          </div>
        )}

        {tick && (
          <div style={{ color: "#333" }}>
            <pre style={{ whiteSpace: "pre-wrap" }}>{tick}</pre>
          </div>
        )}

        {!isTickLoading && !tickError && !tick && (
          <p>Click the button to fetch the current tick.</p>
        )}
      </div>
    </div>
  );
}
