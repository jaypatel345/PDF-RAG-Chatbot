import { Controller, Post, Get, Delete, Patch, UseGuards, Request, UploadedFile, UseInterceptors, Body, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    return this.documentsService.uploadDocument(file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllDocuments() {
    return this.documentsService.getAllDocuments();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchDocuments(@Query('q') query: string) {
    return this.documentsService.searchDocuments(query);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats() {
    return this.documentsService.getDashboardStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDocumentById(@Param('id') id: string) {
    return this.documentsService.getDocumentById(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(+id);
  }

  @Post(':id/reprocess')
  @UseGuards(JwtAuthGuard)
  async reprocessDocument(@Param('id') id: string) {
    return this.documentsService.reprocessDocument(+id);
  }

  @Post(':id/status')
  @UseGuards() // No auth required for internal service calls
  async updateDocumentStatus(@Param('id') id: string, @Body() body: { status: string; page_count?: number; error_message?: string }) {
    return this.documentsService.updateDocumentStatus(+id, body.status, {
      page_count: body.page_count,
      error_message: body.error_message,
    });
  }
}
