import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  MessageSquare,
  Database,
  Trash2,
  Play,
} from "lucide-react";
import toast from "react-hot-toast";
import { useWorkflow } from "../store/WorkflowStore";
import { NodeType, Workflow } from "../types/workflow";
import { pdfApi, workflowApi } from "../services/api";

const Sidebar: React.FC = () => {
  const { setPdfs, pdfs, workflows, setWorkflows, loadWorkflow } =
    useWorkflow();

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: NodeType) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(async (file) => {
        const loadingToast = toast.loading(`Uploading ${file.name}...`);
        try {
          const pdf = await pdfApi.upload(file);
          setPdfs([...pdfs, pdf]);
          toast.success(`${file.name} uploaded successfully!`, {
            id: loadingToast,
          });
        } catch (error) {
          console.error("Failed to upload PDF:", error);
          toast.error(`Failed to upload ${file.name}`, { id: loadingToast });
        }
      });
    },
    [setPdfs, pdfs]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleDeleteWorkflow = useCallback(
    async (workflowId: string) => {
      const loadingToast = toast.loading("Deleting workflow...");
      try {
        await workflowApi.delete(workflowId);
        setWorkflows(workflows.filter((w) => w.id !== workflowId));
        toast.success("Workflow deleted successfully!", { id: loadingToast });
      } catch (error) {
        console.error("Failed to delete workflow:", error);
        toast.error("Failed to delete workflow", { id: loadingToast });
      }
    },
    [workflows, setWorkflows]
  );

  const handleLoadWorkflow = useCallback(
    async (workflow: Workflow) => {
      try {
        loadWorkflow(workflow);
        toast.success(`Loaded workflow: ${workflow.name}`);
      } catch (error) {
        console.error("Failed to load workflow:", error);
        toast.error("Failed to load workflow");
      }
    },
    [loadWorkflow]
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">How to Use</h2>
        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="mb-2">
            <strong>1.</strong> Drag nodes to the canvas
          </p>
          <p className="mb-2">
            <strong>2.</strong> Connect them: Input → RAG → Output
          </p>
          <p className="mb-2">
            <strong>3.</strong> Upload a PDF for the RAG node
          </p>
          <p>
            <strong>4.</strong> Click "Run Workflow" to execute
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Workflow Nodes
        </h2>
        <div className="space-y-3">
          <div
            className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-grab hover:bg-blue-100 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.INPUT)}
          >
            <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-blue-900">Input Node</div>
              <div className="text-sm text-blue-700">
                Enter questions or prompts
              </div>
            </div>
          </div>

          <div
            className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg cursor-grab hover:bg-green-100 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.RAG)}
          >
            <Database className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-green-900">RAG Node</div>
              <div className="text-sm text-green-700">
                PDF processing & AI search
              </div>
            </div>
          </div>

          <div
            className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-grab hover:bg-purple-100 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.OUTPUT)}
          >
            <FileText className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <div className="font-medium text-purple-900">Output Node</div>
              <div className="text-sm text-purple-700">
                Display AI responses
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload PDF</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the PDF here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-1">Drag & drop a PDF here</p>
              <p className="text-sm text-gray-500">or click to select</p>
            </div>
          )}
        </div>
      </div>

      {pdfs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded PDFs
          </h3>
          <div className="space-y-2">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {pdf.originalName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pdf.metadata.pages} pages •{" "}
                        {(pdf.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  {pdf.isIndexed && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Indexed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {workflows.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Saved Workflows
          </h3>
          <div className="space-y-2">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {workflow.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {workflow.nodes?.length || 0} nodes •{" "}
                        {workflow.edges?.length || 0} connections
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleLoadWorkflow(workflow)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Load workflow"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete workflow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
