import { Module } from "@nestjs/common";
import { WorkflowService } from "./workflow.service";
import { WorkflowController } from "./workflow.controller";
import { MemoryStoreService } from "../shared/memory-store.service";
import { PdfModule } from "../pdf/pdf.module";
import { AiModule } from "../ai/ai.module";
import { VectorSearchModule } from "../vector-search/vector-search.module";

@Module({
  imports: [PdfModule, AiModule, VectorSearchModule],
  providers: [WorkflowService, MemoryStoreService],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class WorkflowModule {}
