import { useEffect, useState } from "react";
import "../CapturePage.css";

const ImageFetchPage = () => {
    const [imageB64, setImageB64] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [refreshTick, setRefreshTick] = useState<number>(0);

    const fetchImage = () => {
        setIsLoading(true);
        setError(null);
        setImageB64(null);

        fetch("/api/v1/obc/capture")
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

    useEffect(() => {
        fetchImage();
    }, [refreshTick]);

    const handleRefresh = () => setRefreshTick((t) => t + 1);

    const dataUrl = imageB64 ? `data:image/png;base64,${imageB64}` : null;

    return (
        <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
            <h2>Image Viewer</h2>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={handleRefresh} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Refresh Image"}
                </button>
            </div>

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
