const HomePage = () => {
    return (
        <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
            <h2>Welcome to GCS!</h2>
            <p>
                This is the homepage for the onboarding GCS. Use the tabs above
                to explore different pages and use them as templates.
            </p>
            <div style={{ marginTop: 12 }}>
                <ul>
                    <li>
                        <strong>OBC Status</strong>: Example of fetching from
                        the OBC via Go backend.
                    </li>
                    <li>
                        <strong>Playground</strong>: Minimal state management
                        demo (text input + counter) you can copy to start your
                        own tab.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HomePage;
