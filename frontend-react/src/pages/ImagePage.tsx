import { useEffect, useState } from "react";
import { OBCStatus } from "../protos/onboarding.pb";
import { ODLCObjects, DetectedObject } from "../protos/onboarding.pb";

const ImagePage = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imageData, setImageData] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<number>(
        ODLCObjects.Undefined
    );
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitResponse, setSubmitResponse] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/v1/obc/capture")
            .then(async (response) => {
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(
                        errData.error ||
                            `HTTP error! Status: ${response.status}`
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
    }, [])
    
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
        
        console.log(selectedObject);
        try {
            const message = DetectedObject.create({ objects: selectedObject });
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

    return <div>
        <img 
            src = {`data:image/png;base64,${imageData}`|| ""}
        >
        </img>
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
}

export default ImagePage;