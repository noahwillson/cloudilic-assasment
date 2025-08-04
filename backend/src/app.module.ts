import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { WorkflowModule } from "./workflow/workflow.module";
import { PdfModule } from "./pdf/pdf.module";
import { AiModule } from "./ai/ai.module";
import { VectorSearchModule } from "./vector-search/vector-search.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WorkflowModule,
    PdfModule,
    AiModule,
    VectorSearchModule,
  ],
})
export class AppModule {}
