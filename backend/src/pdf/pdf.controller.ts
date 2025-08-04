import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { PdfService } from "./pdf.service";
import { PdfDocument } from "../types/workflow";

@ApiTags("pdf")
@Controller("pdf")
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: "application/pdf" }),
        ],
      })
    )
    file: Express.Multer.File
  ): Promise<PdfDocument> {
    return await this.pdfService.upload(file);
  }

  @Get()
  async findAll(): Promise<PdfDocument[]> {
    return await this.pdfService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<PdfDocument> {
    return await this.pdfService.findOne(id);
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    return await this.pdfService.remove(id);
  }
}
