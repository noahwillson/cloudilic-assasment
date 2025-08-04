export enum NodeType {
  INPUT = "input",
  RAG = "rag",
  OUTPUT = "output",
}

export interface NodeData {
  label: string;
  content?: string;
  pdfId?: string;
  [key: string]: string | undefined;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: NodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
  isExecuted: boolean;
  lastExecutionResult?: string;
  createdAt: string;
  updatedAt: string;
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
    [key: string]: string | number | string[] | undefined;
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
