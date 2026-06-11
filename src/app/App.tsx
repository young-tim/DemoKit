import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AccessGate } from "../components/demo/AccessGate";
import { ApiDebugPage } from "../pages/ApiDebugPage";
import { ChatDemoPage } from "../pages/ChatDemoPage";
import { HomePage } from "../pages/HomePage";
import { ToolDemoPage } from "../pages/ToolDemoPage";
import { WorkflowDemoPage } from "../pages/WorkflowDemoPage";

export function App() {
  return (
    <AccessGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tool" element={<ToolDemoPage />} />
          <Route path="/chat" element={<ChatDemoPage />} />
          <Route path="/workflow" element={<WorkflowDemoPage />} />
          <Route path="/api-debug" element={<ApiDebugPage />} />
        </Routes>
      </BrowserRouter>
    </AccessGate>
  );
}
