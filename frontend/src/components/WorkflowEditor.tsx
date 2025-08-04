import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Panel,
} from "reactflow";
import toast from "react-hot-toast";
import { useWorkflow } from "../store/WorkflowStore";
import Sidebar from "./Sidebar";
import * as CustomNodes from "./nodes";
import { workflowApi, pdfApi } from "../services/api";
import { NodeType } from "../types/workflow";

const nodeTypes = {
  input: CustomNodes.InputNode,
  rag: CustomNodes.RagNode,
  output: CustomNodes.OutputNode,
};

const WorkflowEditor: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setWorkflows,
    setPdfs,
    isExecuting,
    setExecutionResult,
  } = useWorkflow();

  const { screenToFlowPosition } = useReactFlow();

  const validateWorkflow = useCallback(() => {
    const hasInput = nodes.some((n) => n.type === "input");
    const hasRag = nodes.some((n) => n.type === "rag");
    const hasOutput = nodes.some((n) => n.type === "output");
    const hasConnections = edges.length > 0;
    const ragNode = nodes.find((n) => n.type === "rag");
    const hasPdf = ragNode?.data?.pdfId;

    return { hasInput, hasRag, hasOutput, hasConnections, hasPdf, ragNode };
  }, [nodes, edges]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [workflows, pdfs] = await Promise.all([
          workflowApi.getAll(),
          pdfApi.getAll(),
        ]);
        setWorkflows(workflows);
        setPdfs(pdfs);
        if (workflows.length > 0 || pdfs.length > 0) {
          toast.success(
            `Loaded ${workflows.length} workflows and ${pdfs.length} PDFs`
          );
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load workflows and PDFs");
      }
    };

    loadData();
  }, [setWorkflows, setPdfs]);

  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error("Please add at least one node to the workflow");
      return;
    }

    const inputNodes = nodes.filter((node) => node.type === "input");
    const ragNodes = nodes.filter((node) => node.type === "rag");
    const outputNodes = nodes.filter((node) => node.type === "output");

    if (inputNodes.length === 0) {
      toast.error("Please add an Input node to your workflow");
      return;
    }

    if (outputNodes.length === 0) {
      toast.error("Please add an Output node to your workflow");
      return;
    }

    if (ragNodes.length === 0) {
      toast.error("Please add a RAG node to your workflow");
      return;
    }

    for (const ragNode of ragNodes) {
      if (!ragNode.data.pdfId) {
        toast.error(
          `RAG node "${ragNode.data.label}" must have a PDF selected`
        );
        return;
      }
    }

    if (edges.length === 0) {
      toast.error("Please connect your nodes to create a valid workflow");
      return;
    }

    const loadingToast = toast.loading("Executing workflow...");

    try {
      const workflowData = {
        name: "Workflow",
        description: "Generated workflow",
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create workflow");
      }

      const workflow = await response.json();

      const executeResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/workflow/${workflow.id}/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workflowId: workflow.id,
            userQuery:
              inputNodes[0]?.data.content || "Please process this workflow",
          }),
        }
      );

      if (!executeResponse.ok) {
        const errorData = await executeResponse.json();
        throw new Error(errorData.message || "Failed to execute workflow");
      }

      const result = await executeResponse.json();
      toast.success("Workflow executed successfully!", { id: loadingToast });

      setExecutionResult(result.result);
    } catch (error: unknown) {
      console.error("Failed to execute workflow:", error);
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = (error as { message: string }).message;

        if (
          errorMessage.includes("PDF with ID") &&
          errorMessage.includes("not found")
        ) {
          toast.error(
            "The PDF referenced in your workflow is no longer available. Please upload the PDF again and recreate your workflow.",
            { id: loadingToast }
          );
        } else if (errorMessage.includes("RAG node must have a PDF selected")) {
          toast.error(
            "Please select a PDF document for all RAG nodes in your workflow.",
            { id: loadingToast }
          );
        } else if (errorMessage.includes("valid path from input to output")) {
          toast.error(
            "Please connect all nodes properly. The workflow must have a path from Input → RAG → Output nodes.",
            { id: loadingToast }
          );
        } else if (
          errorMessage.includes("quota") ||
          errorMessage.includes("429")
        ) {
          toast.error(
            "OpenAI API quota exceeded. The workflow will use fallback responses. Please add credits to your OpenAI account for full functionality.",
            { id: loadingToast }
          );
          if (errorMessage.includes("Mock AI Response")) {
            const mockResponse =
              errorMessage.split("Mock AI Response")[1] ||
              "Fallback response generated.";
            setExecutionResult(mockResponse);
          }
        } else if (errorMessage.includes("Failed to generate AI response")) {
          toast.error(
            "AI service temporarily unavailable. Please try again later.",
            { id: loadingToast }
          );
        } else {
          toast.error(errorMessage, { id: loadingToast });
        }
      } else {
        toast.error(
          "Failed to execute workflow. Please check your configuration and try again.",
          { id: loadingToast }
        );
      }
    }
  };

  const handleSaveWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error("Please add nodes to the workflow");
      return;
    }

    const loadingToast = toast.loading("Saving workflow...");

    try {
      const transformedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type as any,
        position: node.position,
        data: node.data,
      }));

      const transformedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
      }));

      const workflow = await workflowApi.create({
        name: "Workflow",
        description: "Generated workflow",
        nodes: transformedNodes,
        edges: transformedEdges,
      });
      toast.success(`Workflow saved with ID: ${workflow.id}`, {
        id: loadingToast,
      });
    } catch (error: unknown) {
      console.error("Failed to save workflow:", error);
      toast.error("Failed to save workflow", { id: loadingToast });
    }
  }, [nodes, edges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel
            position="top-right"
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleSaveWorkflow}
                  className="btn-secondary"
                  disabled={isExecuting}
                >
                  Save Workflow
                </button>
                <button
                  onClick={handleExecuteWorkflow}
                  className="btn-primary"
                  disabled={isExecuting || nodes.length === 0}
                >
                  {isExecuting ? "Executing..." : "Run Workflow"}
                </button>
              </div>

              <div className="text-xs text-gray-600">
                {(() => {
                  const {
                    hasInput,
                    hasRag,
                    hasOutput,
                    hasConnections,
                    hasPdf,
                  } = validateWorkflow();

                  if (!hasInput || !hasRag || !hasOutput) {
                    return "❌ Missing required nodes";
                  }
                  if (!hasConnections) {
                    return "❌ Nodes not connected";
                  }
                  if (!hasPdf) {
                    return "❌ RAG node needs PDF";
                  }
                  return "✅ Workflow ready to run";
                })()}
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowEditor;
