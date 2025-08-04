import { Injectable, BadRequestException } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { PdfService } from "../pdf/pdf.service";
import * as fs from "fs";
import * as path from "path";

interface VectorIndex {
  id: string;
  vectors: number[][];
  texts: string[];
  metadata: {
    pdfId: string;
    chunkSize: number;
    overlap: number;
    createdAt: string;
  };
}

@Injectable()
export class VectorSearchService {
  private readonly indexDir = path.join(process.cwd(), "vector-indices");

  constructor(
    private aiService: AiService,
    private pdfService: PdfService
  ) {
    if (!fs.existsSync(this.indexDir)) {
      fs.mkdirSync(this.indexDir, { recursive: true });
    }
  }

  async createIndex(pdfId: string): Promise<void> {
    try {
      const chunks = await this.pdfService.getChunks(pdfId, 200, 30);
      const maxChunks = 10;

      const limitedChunks = chunks.slice(0, maxChunks);
      const embeddings = await Promise.all(
        limitedChunks.map((chunk) => this.aiService.generateEmbeddings(chunk))
      );

      const index: VectorIndex = {
        id: pdfId,
        vectors: embeddings,
        texts: limitedChunks,
        metadata: {
          pdfId,
          chunkSize: 200,
          overlap: 30,
          createdAt: new Date().toISOString(),
        },
      };

      const indexPath = path.join(this.indexDir, `${pdfId}.json`);
      fs.writeFileSync(indexPath, JSON.stringify(index));

      await this.pdfService.markAsIndexed(pdfId, indexPath);
    } catch (error) {
      console.error("Failed to create vector index:", error);
      throw new BadRequestException(`Failed to create index for PDF ${pdfId}`);
    }
  }

  private async loadIndex(pdfId: string): Promise<VectorIndex | null> {
    try {
      const indexPath = path.join(this.indexDir, `${pdfId}.json`);

      if (!fs.existsSync(indexPath)) {
        await this.createIndex(pdfId);
      }

      const indexData = fs.readFileSync(indexPath, "utf-8");
      return JSON.parse(indexData) as VectorIndex;
    } catch (error) {
      console.error("Failed to load index:", error);
      return null;
    }
  }

  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  async search(pdfId: string, query: string): Promise<string[]> {
    try {
      const index = await this.loadIndex(pdfId);
      if (!index) {
        throw new BadRequestException(`Index not found for PDF ${pdfId}`);
      }

      const queryEmbedding = await this.aiService.generateEmbeddings(query);

      const isFallbackEmbedding = queryEmbedding.every((val) => val === 0);

      if (isFallbackEmbedding) {
        console.warn("Using fallback search due to API quota issues");
        return index.texts.slice(0, 3);
      }

      const similarities = index.vectors.map((vector, i) => ({
        index: i,
        similarity: this.cosineSimilarity(queryEmbedding, vector),
      }));

      similarities.sort((a, b) => b.similarity - a.similarity);

      const topK = Math.min(3, similarities.length);
      const topIndices = similarities.slice(0, topK);

      return topIndices.map((item) => index.texts[item.index]);
    } catch (error) {
      console.error("Vector search error:", error);
      throw new BadRequestException(`Failed to search index for PDF ${pdfId}`);
    }
  }

  async deleteIndex(pdfId: string): Promise<void> {
    try {
      const indexPath = path.join(this.indexDir, `${pdfId}.json`);
      if (fs.existsSync(indexPath)) {
        fs.unlinkSync(indexPath);
      }
    } catch (error) {
      console.error("Failed to delete vector index:", error);
    }
  }
}
