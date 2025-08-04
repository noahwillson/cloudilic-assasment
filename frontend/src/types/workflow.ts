export enum NodeType {
  INPUT = "input",
  RAG = "rag",
  OUTPUT = "output",
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  edges: EdgeData[];
  isExecuted: boolean;
  lastExecutionResult?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NodeData {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    content?: string;
    pdfId?: string;
    [key: string]: any;
  };
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PdfDocument {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  content: string;
  metadata: {
    pages: number;
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    [key: string]: any;
  };
  isIndexed: boolean;
  vectorIndexPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecuteWorkflowRequest {
  workflowId: string;
  userQuery?: string;
  additionalContext?: string;
}

export interface ExecuteWorkflowResponse {
  result: string;
  workflow: Workflow;
}
