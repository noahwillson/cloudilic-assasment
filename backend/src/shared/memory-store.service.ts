import { Injectable } from "@nestjs/common";
import { Workflow, PdfDocument } from "../types/workflow";

@Injectable()
export class MemoryStoreService {
  private workflows = new Map<string, Workflow>();
  private pdfs = new Map<string, PdfDocument>();

  async createWorkflow(
    workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt">
  ): Promise<Workflow> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newWorkflow: Workflow = {
      ...workflow,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  async findAllWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findWorkflowById(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async updateWorkflow(
    id: string,
    updates: Partial<Workflow>
  ): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;

    const updatedWorkflow: Workflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    return this.workflows.delete(id);
  }

  async createPdf(
    pdf: Omit<PdfDocument, "id" | "createdAt" | "updatedAt">
  ): Promise<PdfDocument> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newPdf: PdfDocument = {
      ...pdf,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.pdfs.set(id, newPdf);
    return newPdf;
  }

  async findAllPdfs(): Promise<PdfDocument[]> {
    return Array.from(this.pdfs.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findPdfById(id: string): Promise<PdfDocument | undefined> {
    return this.pdfs.get(id);
  }

  async updatePdf(
    id: string,
    updates: Partial<PdfDocument>
  ): Promise<PdfDocument | undefined> {
    const pdf = this.pdfs.get(id);
    if (!pdf) return undefined;

    const updatedPdf: PdfDocument = {
      ...pdf,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.pdfs.set(id, updatedPdf);
    return updatedPdf;
  }

  async deletePdf(id: string): Promise<boolean> {
    return this.pdfs.delete(id);
  }
}
