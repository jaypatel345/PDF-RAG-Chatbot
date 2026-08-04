import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../database/entities/document.entity';
import { RedisService } from '../redis/redis.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private redisService: RedisService,
  ) {}

  async uploadDocument(file: Express.Multer.File) {
    const document = this.documentRepository.create({
      filename: file.filename,
      original_name: file.originalname,
      file_size: file.size,
      processing_status: 'pending',
    });

    const savedDocument = await this.documentRepository.save(document);

    // Get absolute file path
    const filePath = require('path').resolve(file.path);

    // Publish to Redis for AI processing
    await this.redisService.publish('pdf_upload', {
      documentId: savedDocument.id,
      filePath,
      filename: file.originalname,
    });

    return savedDocument;
  }

  async getAllDocuments() {
    return this.documentRepository.find({
      order: { upload_date: 'DESC' },
    });
  }

  async getDocumentById(id: number) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async deleteDocument(id: number) {
    const document = await this.getDocumentById(id);

    // Delete file from filesystem
    const filePath = path.join('./uploads', document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Publish to Redis to delete from vector DB
    await this.redisService.publish('pdf_delete', {
      documentId: id,
      filename: document.filename,
    });

    await this.documentRepository.remove(document);
    return { message: 'Document deleted successfully' };
  }

  async reprocessDocument(id: number) {
    const document = await this.getDocumentById(id);

    // Update status to pending
    document.processing_status = 'pending';
    await this.documentRepository.save(document);

    // Get absolute file path
    const filePath = require('path').resolve('./uploads', document.filename);

    // Republish to Redis for reprocessing
    await this.redisService.publish('pdf_upload', {
      documentId: document.id,
      filePath,
      filename: document.original_name,
    });

    return document;
  }

  async updateDocumentStatus(id: number, status: string, metadata?: any) {
    const document = await this.getDocumentById(id);
    document.processing_status = status;

    if (metadata) {
      if (metadata.page_count) {
        document.page_count = metadata.page_count;
      }
      if (metadata.error_message) {
        document.error_message = metadata.error_message;
      }
    }

    return this.documentRepository.save(document);
  }

  async searchDocuments(query: string) {
    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.original_name ILIKE :query', { query: `%${query}%` })
      .orderBy('document.upload_date', 'DESC')
      .getMany();
  }

  async getDashboardStats() {
    const totalPDFs = await this.documentRepository.count();
    const processedPDFs = await this.documentRepository.count({
      where: { processing_status: 'completed' },
    });
    const pendingPDFs = await this.documentRepository.count({
      where: { processing_status: 'pending' },
    });

    const recentDocuments = await this.documentRepository.find({
      order: { upload_date: 'DESC' },
      take: 5,
    });

    return {
      totalPDFs,
      processedPDFs,
      pendingPDFs,
      recentDocuments,
    };
  }
}
