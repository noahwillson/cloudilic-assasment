import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
const pdfParse = require("pdf-parse");
import { v4 as uuidv4 } from "uuid";
import { MemoryStoreService } from "../shared/memory-store.service";
import { PdfDocument } from "../types/workflow";

@Injectable()
export class PdfService {
  constructor(private memoryStore: MemoryStoreService) {}

  async upload(file: Express.Multer.File): Promise<PdfDocument> {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    if (file.mimetype !== "application/pdf") {
      throw new BadRequestException("Only PDF files are allowed");
    }

    try {
      const pdfBuffer = file.buffer;
      const pdfData = await pdfParse(pdfBuffer);

      const metadata = {
        pages: pdfData.numpages,
        title: pdfData.info?.Title || "",
        author: pdfData.info?.Author || "",
        subject: pdfData.info?.Subject || "",
        keywords: pdfData.info?.Keywords
          ? pdfData.info.Keywords.split(",").map((k) => k.trim())
          : [],
      };

      const pdfDocument = await this.memoryStore.createPdf({
        filename: `${uuidv4()}.pdf`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        content: pdfData.text,
        metadata,
        isIndexed: false,
      });

      return pdfDocument;
    } catch (error) {
      throw new BadRequestException(`Failed to parse PDF: ${error.message}`);
    }
  }

  async findAll(): Promise<PdfDocument[]> {
    return await this.memoryStore.findAllPdfs();
  }

  async findOne(id: string): Promise<PdfDocument> {
    const pdfDocument = await this.memoryStore.findPdfById(id);
    if (!pdfDocument) {
      throw new NotFoundException(`PDF document with ID ${id} not found`);
    }
    return pdfDocument;
  }

  async remove(id: string): Promise<void> {
    const success = await this.memoryStore.deletePdf(id);
    if (!success) {
      throw new NotFoundException(`PDF document with ID ${id} not found`);
    }
  }

  async markAsIndexed(
    id: string,
    vectorIndexPath: string
  ): Promise<PdfDocument> {
    const pdfDocument = await this.findOne(id);
    const updatedPdf = await this.memoryStore.updatePdf(id, {
      isIndexed: true,
      vectorIndexPath,
    });

    if (!updatedPdf) {
      throw new NotFoundException(`PDF document with ID ${id} not found`);
    }

    return updatedPdf;
  }

  async getContent(id: string): Promise<string> {
    const pdfDocument = await this.findOne(id);
    return pdfDocument.content;
  }

  async getChunks(
    id: string,
    chunkSize: number = 300,
    overlap: number = 50
  ): Promise<string[]> {
    const content = await this.getContent(id);
    const chunks: string[] = [];

    const maxContentLength = 10000;
    const limitedContent =
      content.length > maxContentLength
        ? content.substring(0, maxContentLength)
        : content;

    const maxChunks = 20;
    let chunkCount = 0;
    let start = 0;

    while (start < limitedContent.length && chunkCount < maxChunks) {
      const end = Math.min(start + chunkSize, limitedContent.length);
      const chunk = limitedContent.substring(start, end);
      chunks.push(chunk);
      start = end - overlap;
      chunkCount++;
    }

    return chunks;
  }
}
