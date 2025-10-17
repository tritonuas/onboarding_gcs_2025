import { useState } from "react";
import HomePage from "./pages/HomePage";
import StatusPage from "./pages/StatusPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import ImagePage from "./pages/ImagePage";
import "./tabs.css";

type TabKey = "home" | "status" | "playground" | "capture";

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const renderActivePage = () => {
    if (activeTab === "home") return <HomePage />;
    if (activeTab === "status") return <StatusPage />;
    if (activeTab === "playground") return <PlaygroundPage />;
    if (activeTab === "capture") return <ImagePage />;
    return null;
  };

  return (
    <div className="tabs-container" style={{ fontFamily: "sans-serif" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0 }}>GCS Onboarding Tutorial</h1>
      </div>

      <nav className="tabs-header" role="tablist" aria-label="Main tabs">
        {/* Tab buttons */}
        <button
          className={`tab-button${activeTab === "home" ? " active" : ""}`}
          role="tab"
          aria-selected={activeTab === "home"}
          onClick={() => setActiveTab("home")}
        >
          Home
        </button>
        <button
          className={`tab-button${activeTab === "status" ? " active" : ""}`}
          role="tab"
          aria-selected={activeTab === "status"}
          onClick={() => setActiveTab("status")}
        >
          OBC Status
        </button>
        <button
          className={`tab-button${activeTab === "playground" ? " active" : ""}`}
          role="tab"
          aria-selected={activeTab === "playground"}
          onClick={() => setActiveTab("playground")}
        >
          Playground
        </button>
        <button
          className={`tab-button${activeTab === "capture" ? " active" : ""}`}
          role="tab"
          aria-selected={activeTab === "capture"}
          onClick={() => setActiveTab("capture")}
        >
          Image Capture
        </button>
      </nav>
      <main className="tabs-main">{renderActivePage()}</main>
    </div>
  );
}

export default App;
