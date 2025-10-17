import { useState } from "react";
import { ODLCObjects, DetectedObject } from "../protos/onboarding.pb";

export default function ImagePage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tick, setTick] = useState<string | null>(null);
  const [tickError, setTickError] = useState<string | null>(null);
  const [isTickLoading, setIsTickLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<string | null>(null);

  // message passing
  const [selectedObject, setSelectedObject] = useState<number>(
    ODLCObjects.Undefined
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResponse, setSubmitResponse] = useState<string | null>(null);

  const enumEntries = Object.entries(ODLCObjects).filter(
    ([, value]) => typeof value === "number"
  ) as [string, number][];
  const enumOptions = enumEntries
    .filter(([, value]) => value !== -1)
    .sort((a, b) => a[1] - b[1]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitResponse(null);

    try {
      const message = DetectedObject.create({ object: selectedObject });
      const payload = DetectedObject.toJSON(message);

      const resp = await fetch("/api/v1/obc/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Prefer JSON, but gracefully fall back to text if not JSON
      const contentType = resp.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await resp.json()
        : await resp.text();
      if (!resp.ok) {
        throw new Error(
          (typeof data === "object" && data && (data.error || data.message)) ||
            `HTTP error! Status: ${resp.status}`
        );
      }
      setSubmitResponse(
        typeof data === "string" ? data : JSON.stringify(data, null, 2)
      );
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit message");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <section
        style={{
          marginTop: "16px",
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: 6,
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Submit Detected Object</h3>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label htmlFor="detected-object">Object</label>
          <select
            id="detected-object"
            value={selectedObject}
            onChange={(e) => setSelectedObject(Number(e.target.value))}
          >
            {enumOptions.map(([name, value]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
          <button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
        {submitError && (
          <div className="error-box" style={{ marginTop: 8 }}>
            <pre style={{ whiteSpace: "pre-wrap" }}>{submitError}</pre>
          </div>
        )}
        {submitResponse && (
          <div style={{ marginTop: 8 }}>
            <pre style={{ whiteSpace: "pre-wrap" }}>{submitResponse}</pre>
          </div>
        )}
      </section>
    </div>
  );
}
