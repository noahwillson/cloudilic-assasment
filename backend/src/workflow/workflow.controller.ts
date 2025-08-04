import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { WorkflowService } from "./workflow.service";
import { Workflow, ExecuteWorkflowRequest } from "../types/workflow";

@ApiTags("workflow")
@Controller("workflow")
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @ApiOperation({ summary: "Create a new workflow" })
  @ApiResponse({
    status: 201,
    description: "Workflow created successfully",
  })
  create(
    @Body() createWorkflowDto: Omit<Workflow, "id" | "createdAt" | "updatedAt">
  ): Promise<Workflow> {
    return this.workflowService.create(createWorkflowDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all workflows" })
  @ApiResponse({
    status: 200,
    description: "List of workflows",
  })
  findAll(): Promise<Workflow[]> {
    return this.workflowService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get workflow by ID" })
  @ApiResponse({
    status: 200,
    description: "Workflow found",
  })
  findOne(@Param("id") id: string): Promise<Workflow> {
    return this.workflowService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update workflow" })
  @ApiResponse({
    status: 200,
    description: "Workflow updated successfully",
  })
  update(
    @Param("id") id: string,
    @Body() updateWorkflowDto: Partial<Workflow>
  ): Promise<Workflow> {
    return this.workflowService.update(id, updateWorkflowDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete workflow" })
  @ApiResponse({
    status: 200,
    description: "Workflow deleted successfully",
  })
  remove(@Param("id") id: string): Promise<void> {
    return this.workflowService.remove(id);
  }

  @Post(":id/execute")
  @ApiOperation({ summary: "Execute workflow" })
  @ApiResponse({
    status: 200,
    description: "Workflow executed successfully",
  })
  execute(
    @Param("id") id: string,
    @Body() executeWorkflowDto: ExecuteWorkflowRequest
  ) {
    return this.workflowService.executeWorkflow(executeWorkflowDto);
  }
}
