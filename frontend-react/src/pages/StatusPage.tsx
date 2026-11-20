import { useState } from "react";
import { OBCStatus } from "../protos/onboarding.pb";

const StatusPage = () => {
    const [status, setStatus] = useState<OBCStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tick, setTick] = useState<string | null>(null);
    const [tickError, setTickError] = useState<string | null>(null);
    const [isTickLoading, setIsTickLoading] = useState<boolean>(false);
    const [tick2, setTick2] = useState<string | null>(null);
    const [tick2Error, setTick2Error] = useState<string | null>(null);
    const [isTick2Loading, setIsTick2Loading] = useState<boolean>(false);
    const [getTimesPressed, setTimesPressed] = useState<number>(0);
    var numTimesPressed = 0

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

    const fetchTick = () => {
        console.log("Hi there!")
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
                            errData.error ||
                                `HTTP error! Status: ${response.status}`
                        );
                    } catch (_) {
                        throw new Error(
                            `HTTP error! Status: ${response.status}`
                        );
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

    const fetchTick2 = () => {
        setIsTick2Loading(true);
        setTick2Error(null);
        setTick2(null);

        const bust = Date.now();
        fetch(`/api/v1/obc/tick?_=${bust}`, { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    // try parse JSON error from proxy, else use status text
                    try {
                        const errData = await response.json();
                        throw new Error(
                            errData.error ||
                                `HTTP error! Status: ${response.status}`
                        );
                    } catch (_) {
                        throw new Error(
                            `HTTP error! Status: ${response.status}`
                        );
                    }
                }
                return response.text();
            })
            .then((text) => {
                // numTimesPressed++
                setTimesPressed(getTimesPressed + 1)
                setTick2(text + " Times pressed: " + getTimesPressed);
            })
            .catch((err) => {
                setTick2Error(err.message);
            })
            .finally(() => {
                setIsTick2Loading(false);
            });
    };

    return (
        <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
            <h2>OBC Status</h2>
            <div>
                <button onClick={fetchStatus} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Get OBC Status"}
                </button>
                <button
                    onClick={fetchTick}
                    disabled={isTickLoading}
                    style={{ marginLeft: "10px" }}
                >
                    {isTickLoading ? "Loading..." : "Get Current Tick"}
                </button>
                <button
                    onClick={fetchTick2}
                    disabled={isTick2Loading}
                    style={{ marginLeft: "10px" }}
                >
                    {isTick2Loading ? "Loading..." : "Get Current Tick with times pressed"}
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

                <hr style={{ margin: "16px 0" }} />
                <h3>Current Counter:</h3>

                {tick2Error && (
                    <div style={{ color: "magenta" }}>
                        <h4>Error:</h4>
                        <pre>{tick2Error}</pre>
                    </div>
                )}

                {tick2 && (
                    <div style={{ color: "pink" }}>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{tick2}</pre>
                    </div>
                )}

                {!isTick2Loading && !tick2Error && !tick2 && (
                    <p>Click the button to fetch the current tick.</p>
                )}

            </div>
        </div>
    );
};

export default StatusPage;
