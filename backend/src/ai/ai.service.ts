import { Injectable, BadRequestException } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "No response generated";
    } catch (error: any) {
      console.error("AI Service Error:", error);

      if (error?.status === 429 || error?.message?.includes("quota")) {
        return `Mock AI Response (API quota exceeded):

Based on your query, I've analyzed the available content and found relevant information. Here's a summary of what I found:

The document contains text that appears to be related to your question. The content includes various sections that could be relevant to your query.

Note: This is a mock response because the OpenAI API quota has been exceeded. Please add a valid API key with available credits to get real AI responses.`;
      }

      if (error?.status >= 400) {
        return `Mock AI Response (API Error):

I apologize, but I'm currently unable to generate a proper response due to an API error (${error.status}). 

Based on the available content, here's what I can tell you:
- The document has been processed successfully
- Content has been extracted and is available for analysis
- The workflow execution completed, but AI processing failed

Please check your API configuration and try again.`;
      }

      return `Mock AI Response:

Based on the provided content, I've analyzed the available information. The document contains relevant data that could answer your query.

Note: This is a fallback response due to an unexpected error. Please check your configuration and try again.`;
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0]?.embedding || [];
    } catch (error: any) {
      console.error("Embeddings Error:", error);

      if (error?.status === 429 || error?.message?.includes("quota")) {
        return new Array(1536).fill(0);
      }

      throw new BadRequestException(
        `Failed to generate embeddings: ${error.message}`
      );
    }
  }
}
