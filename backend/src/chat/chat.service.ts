import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../database/entities/chat.entity';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    private redisService: RedisService,
  ) {}

  async askQuestion(question: string, sessionId?: string) {
    const session = sessionId || uuidv4();

    // Generate a unique request ID
    const requestId = uuidv4();

    // Subscribe to the response channel
    const response = await this.redisService.publishAndWaitForResponse(
      'chat_request',
      {
        requestId,
        question,
        sessionId: session,
      },
      requestId,
    );

    // Save chat to database
    const chat = this.chatRepository.create({
      session_id: session,
      question,
      answer: response.answer || 'No response received',
      source_document: response.source_document,
      page_number: response.page_number,
      suggested_questions: response.suggested_questions,
    });

    await this.chatRepository.save(chat);

    return {
      sessionId: session,
      question,
      ...response,
    };
  }

  async getChatHistory(sessionId: string) {
    return this.chatRepository.find({
      where: { session_id: sessionId },
      order: { created_at: 'ASC' },
    });
  }

  async getChatStats() {
    const totalChats = await this.chatRepository.count();
    const totalSessions = await this.chatRepository
      .createQueryBuilder('chat')
      .select('COUNT(DISTINCT chat.session_id)', 'total')
      .getRawOne();

    return {
      totalChats,
      totalSessions: parseInt(totalSessions.total) || 0,
    };
  }
}
