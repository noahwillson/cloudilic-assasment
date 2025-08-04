import { Module } from "@nestjs/common";
import { VectorSearchService } from "./vector-search.service";
import { AiModule } from "../ai/ai.module";
import { PdfModule } from "../pdf/pdf.module";

@Module({
  imports: [AiModule, PdfModule],
  providers: [VectorSearchService],
  exports: [VectorSearchService],
})
export class VectorSearchModule {}
