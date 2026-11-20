import { useState } from "react";
import "./ImagePage.css";
import { ODLCObjects, DetectedObject } from "../protos/onboarding.pb";

const ImagePage = () => {
    // alert(Object.entries(ODLCObjects));
    const [imageB64, setImageB64] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchImage = () => {
        setIsLoading(true);
        setError(null);
        setImageB64(null);

        fetch(`/api/v1/obc/capture`)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Image not found")
                }
                return response.text();
            })
            .then((text: string) => {
                setImageB64(text)
            })
            .catch((err: Error) => {
                setError(err.message)
            })
            .finally(() => {
                setIsLoading(false)
            });
    };

    const handleRefresh = () => {
        fetchImage();
    };

    const dataUrl = imageB64 ? `data:image/png;base64,${imageB64}` : null;

    const [selectedObject, setSelectedObject] = useState<number>(
        ODLCObjects.Undefined
    );
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitResponse, setSubmitResponse] = useState<string | null>(null);
    var objs = Object.entries(ODLCObjects).filter((([length, value]) => typeof value === "number" && value >= 0))
    const submitObject = async () => {
        console.log("MikuBondage");
        const message = DetectedObject.create({ object: selectedObject });
        const payload = DetectedObject.toJSON(message);
        console.log(payload)

        setIsSubmitting(true)
        setSubmitError(null)
        setSubmitResponse(null)

        try {
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
    }
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
                
                {dataUrl && !error && (
                    <div className="objectSelect" >
                        <select onChange={(e) => setSelectedObject(Number(e.target.value))}>
                            {objs.map(([obj, id]) => (
                                <option value={id}>{id} {obj}</option>
                            ))}
                        </select>
                    </div>
                )}
            </section>
            Selected object: {selectedObject}
            
                <div className="SubmitButton">
                    <button
                        onClick={submitObject}
                        disabled={isSubmitting}
                        style={{ marginLeft: "10px" }}
                    >
                        {isSubmitting ? "Loading..." : "Submit object selection"}
                    </button>
                </div>
            

        </div>
        
    );
};

export default ImagePage;