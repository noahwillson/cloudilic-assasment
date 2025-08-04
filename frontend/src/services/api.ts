import axios from "axios";
import {
  Workflow,
  PdfDocument,
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse,
} from "../types/workflow";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const workflowApi = {
  create: async (workflow: Partial<Workflow>): Promise<Workflow> => {
    const response = await api.post("/workflow", workflow);
    return response.data;
  },

  getAll: async (): Promise<Workflow[]> => {
    const response = await api.get("/workflow");
    return response.data;
  },

  getById: async (id: string): Promise<Workflow> => {
    const response = await api.get(`/workflow/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    workflow: Partial<Workflow>
  ): Promise<Workflow> => {
    const response = await api.patch(`/workflow/${id}`, workflow);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workflow/${id}`);
  },

  execute: async (
    request: ExecuteWorkflowRequest
  ): Promise<ExecuteWorkflowResponse> => {
    const response = await api.post(
      `/workflow/${request.workflowId}/execute`,
      request
    );
    return response.data;
  },
};

export const pdfApi = {
  upload: async (file: File): Promise<PdfDocument> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/pdf/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAll: async (): Promise<PdfDocument[]> => {
    const response = await api.get("/pdf");
    return response.data;
  },

  getById: async (id: string): Promise<PdfDocument> => {
    const response = await api.get(`/pdf/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pdf/${id}`);
  },
};

export default api;
