import { ChangeEvent, useState } from "react";

const PlaygroundPage = () => {
    const [typedMessage, setTypedMessage] = useState<string>("");
    const [counterValue, setCounterValue] = useState<number>(0);

    const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTypedMessage(event.target.value);
    };

    const incrementCounter = () => {
        setCounterValue((current) => current + 1);
    };

    const decrementCounter = () => {
        setCounterValue((current) => current - 1);
    };

    return (
        <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
            <h2>Playground</h2>
            <p>
                This tab demonstrates a simple React state management with a
                text input and a counter. You can use it as a template when
                creating your own tabs.
            </p>

            <section style={{ marginTop: "20px" }}>
                <label
                    htmlFor="message-input"
                    style={{ display: "block", marginBottom: 8 }}
                >
                    Message
                </label>
                <input
                    id="message-input"
                    value={typedMessage}
                    onChange={handleMessageChange}
                    placeholder="Start typing..."
                    style={{
                        padding: "8px 10px",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        width: "100%",
                        maxWidth: 420,
                    }}
                />
            </section>

            <section style={{ marginTop: "20px" }}>
                <label
                    htmlFor="message-input"
                    style={{ display: "block", marginBottom: 8 }}
                >
                    Counter
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={decrementCounter} aria-label="Decrement">
                        -
                    </button>
                    <div
                        aria-live="polite"
                        style={{ minWidth: 40, textAlign: "center" }}
                    >
                        {counterValue}
                    </div>
                    <button onClick={incrementCounter} aria-label="Increment">
                        +
                    </button>
                </div>
            </section>

            <section
                style={{
                    marginTop: "20px",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    backgroundColor: "#f9f9f9",
                }}
            >
                <h3 style={{ marginTop: 0 }}>Live preview</h3>
                <p>
                    <strong>Message:</strong> {typedMessage || "(nothing yet)"}
                </p>
                <p>
                    <strong>Character count:</strong> {typedMessage.length}
                </p>
                <p>
                    <strong>Counter value:</strong> {counterValue}
                </p>
                <p>
                    <strong>Example json:</strong>
                </p>
                <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                    {JSON.stringify(
                        { message: typedMessage, counter: counterValue },
                        null, // replacer
                        2 // indent spaces
                    )}
                </pre>
            </section>
        </div>
    );
};

export default PlaygroundPage;
