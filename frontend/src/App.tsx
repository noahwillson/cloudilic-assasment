import { ReactFlowProvider } from "reactflow";
import { Toaster } from "react-hot-toast";
import "reactflow/dist/style.css";
import WorkflowEditor from "./components/WorkflowEditor";
import { WorkflowProvider } from "./store/WorkflowStore";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <WorkflowProvider>
        <ReactFlowProvider>
          <WorkflowEditor />
        </ReactFlowProvider>
      </WorkflowProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
