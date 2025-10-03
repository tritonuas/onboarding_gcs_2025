import { useState } from "react";
import "./ImagePage.css";
import { ODLCObjects, DetectedObject } from "../protos/onboarding.pb";

const ImageFetchPage = () => {
    const [imageB64, setImageB64] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [selectedObject, setSelectedObject] = useState<number>(
        ODLCObjects.Undefined
    );
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitResponse, setSubmitResponse] = useState<string | null>(null);

    const fetchImage = () => {
        setIsLoading(true);
        setError(null);
        setImageB64(null);

        const bust = Date.now();
        fetch(`/api/v1/obc/capture?_=${bust}`, { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    // try parse JSON error; if fails, use status
                    try {
                        const errData = await response.json();
                        const detail = errData.upstream_message
                            ? ` - ${errData.upstream_message}`
                            : "";
                        throw new Error(
                            (errData.error ||
                                `HTTP error! Status: ${response.status}`) +
                                detail
                        );
                    } catch (_) {
                        throw new Error(
                            `HTTP error! Status: ${response.status}`
                        );
                    }
                }
                return response.text();
            })
            .then((text: string) => {
                setImageB64(text);
            })
            .catch((err: Error) => {
                setError(err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleRefresh = () => {
        fetchImage();
    };

    const enumEntries = Object.entries(ODLCObjects).filter(
        ([, value]) => typeof value === "number"
    ) as [string, number][];
    const enumOptions = enumEntries
        .filter(([, value]) => value !== -1) // exclude UNRECOGNIZED
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
                    (typeof data === "object" &&
                        data &&
                        (data.error || data.message)) ||
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

    const dataUrl = imageB64 ? `data:image/png;base64,${imageB64}` : null;

    return (
        <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
            <h2>Image Viewer</h2>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={handleRefresh} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Load / Reload Image"}
                </button>
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
                        onChange={(e) =>
                            setSelectedObject(Number(e.target.value))
                        }
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
                        <pre style={{ whiteSpace: "pre-wrap" }}>
                            {submitError}
                        </pre>
                    </div>
                )}
                {submitResponse && (
                    <div style={{ marginTop: 8 }}>
                        <pre style={{ whiteSpace: "pre-wrap" }}>
                            {submitResponse}
                        </pre>
                    </div>
                )}
            </section>

            <section
                style={{
                    marginTop: "20px",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    backgroundColor: "#f9f9f9",
                    minHeight: 200,
                }}
            >
                <h3 style={{ marginTop: 0 }}>Preview</h3>

                {isLoading && <p>Fetching image from backend...</p>}

                {error && (
                    <div className="error-box">
                        <h4>Error</h4>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
                        <button onClick={handleRefresh} disabled={isLoading}>
                            Retry
                        </button>
                    </div>
                )}

                {!isLoading && !error && !dataUrl && (
                    <p>No image yet. Click Refresh Image to fetch.</p>
                )}

                {dataUrl && !error && (
                    <div className="image-container">
                        <img
                            src={dataUrl}
                            alt="Fetched from backend"
                            className="image-preview"
                        />
                    </div>
                )}
            </section>
        </div>
    );
};

export default ImageFetchPage;
