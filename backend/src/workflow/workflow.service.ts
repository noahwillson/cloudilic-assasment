import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { MemoryStoreService } from "../shared/memory-store.service";
import { Workflow, NodeType, ExecuteWorkflowRequest } from "../types/workflow";
import { PdfService } from "../pdf/pdf.service";
import { AiService } from "../ai/ai.service";
import { VectorSearchService } from "../vector-search/vector-search.service";

interface WorkflowContext {
  userQuery?: string;
  pdfContext?: string;
}

interface WorkflowExecutionContext {
  userQuery?: string;
  pdfContext?: string;
}

@Injectable()
export class WorkflowService {
  constructor(
    private memoryStore: MemoryStoreService,
    private pdfService: PdfService,
    private aiService: AiService,
    private vectorSearchService: VectorSearchService
  ) {}

  async create(
    workflowData: Omit<Workflow, "id" | "createdAt" | "updatedAt">
  ): Promise<Workflow> {
    return await this.memoryStore.createWorkflow(workflowData);
  }

  async findAll(): Promise<Workflow[]> {
    return await this.memoryStore.findAllWorkflows();
  }

  async findOne(id: string): Promise<Workflow> {
    const workflow = await this.memoryStore.findWorkflowById(id);
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    return workflow;
  }

  async update(
    id: string,
    updateWorkflowDto: Partial<Workflow>
  ): Promise<Workflow> {
    const workflow = await this.findOne(id);
    const updatedWorkflow = await this.memoryStore.updateWorkflow(
      id,
      updateWorkflowDto
    );

    if (!updatedWorkflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return updatedWorkflow;
  }

  async remove(id: string): Promise<void> {
    const success = await this.memoryStore.deleteWorkflow(id);
    if (!success) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
  }

  async executeWorkflow(
    executeWorkflowDto: ExecuteWorkflowRequest
  ): Promise<{ result: string; workflow: Workflow }> {
    const workflow = await this.findOne(executeWorkflowDto.workflowId);

    this.validateWorkflowStructure(workflow);

    const result = await this.executeWorkflowSteps(
      workflow,
      executeWorkflowDto
    );

    const updatedWorkflow = await this.memoryStore.updateWorkflow(workflow.id, {
      isExecuted: true,
      lastExecutionResult: result,
    });

    if (!updatedWorkflow) {
      throw new NotFoundException(`Workflow with ID ${workflow.id} not found`);
    }

    return { result, workflow: updatedWorkflow };
  }

  private validateWorkflowStructure(workflow: Workflow): void {
    const inputNodes = workflow.nodes.filter(
      (node) => node.type === NodeType.INPUT
    );
    const ragNodes = workflow.nodes.filter(
      (node) => node.type === NodeType.RAG
    );
    const outputNodes = workflow.nodes.filter(
      (node) => node.type === NodeType.OUTPUT
    );

    if (inputNodes.length === 0) {
      throw new BadRequestException(
        "Workflow must have at least one input node"
      );
    }

    if (outputNodes.length === 0) {
      throw new BadRequestException(
        "Workflow must have at least one output node"
      );
    }

    const hasValidPath = this.checkValidPath(workflow);
    if (!hasValidPath) {
      throw new BadRequestException(
        "Workflow must have a valid path from input to output"
      );
    }
  }

  private checkValidPath(workflow: Workflow): boolean {
    const inputNodes = workflow.nodes.filter(
      (node) => node.type === NodeType.INPUT
    );
    const outputNodes = workflow.nodes.filter(
      (node) => node.type === NodeType.OUTPUT
    );

    for (const inputNode of inputNodes) {
      for (const outputNode of outputNodes) {
        if (this.hasPathBetweenNodes(workflow, inputNode.id, outputNode.id)) {
          return true;
        }
      }
    }
    return false;
  }

  private hasPathBetweenNodes(
    workflow: Workflow,
    startNodeId: string,
    endNodeId: string
  ): boolean {
    const visited = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;

      if (currentNodeId === endNodeId) {
        return true;
      }

      if (visited.has(currentNodeId)) {
        continue;
      }

      visited.add(currentNodeId);

      const outgoingEdges = workflow.edges.filter(
        (edge) => edge.source === currentNodeId
      );

      for (const edge of outgoingEdges) {
        queue.push(edge.target);
      }
    }

    return false;
  }

  private async executeWorkflowSteps(
    workflow: Workflow,
    executeDto: ExecuteWorkflowRequest
  ): Promise<string> {
    try {
      const executionOrder = this.getExecutionOrder(workflow);
      const context: WorkflowExecutionContext = {};

      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        switch (node.type) {
          case NodeType.INPUT:
            context.userQuery =
              node.data.content ||
              executeDto.userQuery ||
              "Please process this workflow";
            break;

          case NodeType.RAG:
            if (node.data.pdfId) {
              try {
                // Check if PDF exists first
                const pdfExists = await this.pdfService.findOne(
                  node.data.pdfId
                );
                if (!pdfExists) {
                  throw new BadRequestException(
                    `PDF with ID ${node.data.pdfId} not found. Please upload the PDF again.`
                  );
                }

                const pdfContent = await this.pdfService.getContent(
                  node.data.pdfId
                );
                const chunks = await this.pdfService.getChunks(node.data.pdfId);

                if (chunks.length > 0) {
                  try {
                    const relevantChunks =
                      await this.vectorSearchService.search(
                        node.data.pdfId,
                        context.userQuery || ""
                      );
                    context.pdfContext = relevantChunks.join("\n\n");
                  } catch (searchError) {
                    console.warn(
                      "Vector search failed, using fallback:",
                      searchError
                    );
                    // Fallback to simple text extraction
                    context.pdfContext = pdfContent.substring(0, 2000);
                  }
                } else {
                  context.pdfContext = pdfContent.substring(0, 2000);
                }
              } catch (error) {
                if (error instanceof BadRequestException) {
                  throw error;
                }
                console.error("Failed to process PDF:", error);
                throw new BadRequestException(
                  `Failed to process PDF: ${error.message}`
                );
              }
            } else {
              throw new BadRequestException(
                "RAG node must have a PDF selected. Please select a PDF document."
              );
            }
            break;

          case NodeType.OUTPUT:
            const prompt = this.buildAIPrompt(context);
            const aiResponse = await this.aiService.generateResponse(prompt);
            return aiResponse;
        }
      }

      throw new BadRequestException("No output node found in workflow");
    } catch (error) {
      console.error("Workflow execution error:", error);
      throw error;
    }
  }

  private getExecutionOrder(workflow: Workflow): string[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of workflow.nodes) {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of workflow.edges) {
      const neighbors = graph.get(edge.source) || [];
      neighbors.push(edge.target);
      graph.set(edge.source, neighbors);

      const currentInDegree = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, currentInDegree + 1);
    }

    const queue: string[] = [];
    const result: string[] = [];

    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        const currentInDegree = inDegree.get(neighbor) || 0;
        inDegree.set(neighbor, currentInDegree - 1);

        if (currentInDegree - 1 === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  private buildAIPrompt(context: WorkflowContext): string {
    const { userQuery, pdfContext } = context;

    return `Based on the following context, please provide a comprehensive answer to the user's query.

User Query: ${userQuery || "Please process this workflow"}

PDF Context: ${pdfContext || "No PDF context available"}

Please provide a detailed and helpful response based on the information provided.`;
  }
}
