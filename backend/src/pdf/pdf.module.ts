import { Module } from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { PdfController } from "./pdf.controller";
import { MemoryStoreService } from "../shared/memory-store.service";

@Module({
  providers: [PdfService, MemoryStoreService],
  controllers: [PdfController],
  exports: [PdfService],
})
export class PdfModule {}
