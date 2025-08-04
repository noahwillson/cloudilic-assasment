import { create } from "zustand";
import {
  Node as ReactFlowNode,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "reactflow";
import { NodeType, Workflow, PdfDocument } from "../types/workflow";

export interface WorkflowState {
  nodes: ReactFlowNode[];
  edges: Edge[];
  selectedPdf: string | null;
  isExecuting: boolean;
  executionResult: string | null;
  workflows: Workflow[];
  pdfs: PdfDocument[];
}

export interface WorkflowActions {
  setNodes: (nodes: ReactFlowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  setSelectedPdf: (pdfId: string | null) => void;
  setExecuting: (executing: boolean) => void;
  setExecutionResult: (result: string | null) => void;
  setWorkflows: (workflows: Workflow[]) => void;
  setPdfs: (pdfs: PdfDocument[]) => void;
  clearWorkflow: () => void;
  loadWorkflow: (workflow: Workflow) => void;
}

export type WorkflowStore = WorkflowState & WorkflowActions;

const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [] as ReactFlowNode[],
  edges: [],
  selectedPdf: null,
  isExecuting: false,
  executionResult: null,
  workflows: [],
  pdfs: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },

  addNode: (type, position) => {
    const newNode: ReactFlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        content: "",
        pdfId: type === NodeType.RAG ? get().selectedPdf : undefined,
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },

  setSelectedPdf: (pdfId) => set({ selectedPdf: pdfId }),
  setExecuting: (executing) => set({ isExecuting: executing }),
  setExecutionResult: (result) => set({ executionResult: result }),
  setWorkflows: (workflows) => set({ workflows }),
  setPdfs: (pdfs) => set({ pdfs }),

  clearWorkflow: () => {
    set({
      nodes: [] as ReactFlowNode[],
      edges: [],
      selectedPdf: null,
      executionResult: null,
    });
  },

  loadWorkflow: (workflow) => {
    set({
      nodes: (workflow.nodes || []) as ReactFlowNode[],
      edges: workflow.edges || [],
      selectedPdf: null,
      executionResult: null,
    });
  },
}));

export { useWorkflowStore };

// Context provider for React components
import React, { createContext, useContext, ReactNode } from "react";

const WorkflowContext = createContext<WorkflowStore | null>(null);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const store = useWorkflowStore();
  return (
    <WorkflowContext.Provider value={store}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
};
