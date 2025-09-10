import { useState } from "react";
import { OBCStatus } from "../protos/onboarding.pb";

const StatusPage = () => {
    const [status, setStatus] = useState<OBCStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchStatus = () => {
        setIsLoading(true);
        setError(null);
        setStatus(null);

        fetch("/api/v1/obc/status")
            .then(async (response) => {
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(
                        errData.error ||
                            `HTTP error! Status: ${response.status}`
                    );
                }
                return response.json();
            })
            .then((data) => {
                setStatus(OBCStatus.fromJSON(data));
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
            <h2>OBC Status</h2>
            <button onClick={fetchStatus} disabled={isLoading}>
                {isLoading ? "Loading..." : "Get OBC Status"}
            </button>

            <div
                style={{
                    marginTop: "20px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    minHeight: "100px",
                }}
            >
                <h3>Response from OBC:</h3>
                {isLoading && <p>Fetching status from OBC via Go proxy...</p>}

                {error && (
                    <div style={{ color: "red" }}>
                        <h4>Error:</h4>
                        <pre>{error}</pre>
                        <p>Is the C++ OBCpp server running on port 5010?</p>
                    </div>
                )}

                {status && (
                    <div style={{ color: "green" }}>
                        <h4>Success!</h4>
                        <pre>{JSON.stringify(status, null, 2)}</pre>
                    </div>
                )}

                {!isLoading && !error && !status && (
                    <p>Click the button to fetch the OBC status.</p>
                )}
            </div>
        </div>
    );
};

export default StatusPage;
