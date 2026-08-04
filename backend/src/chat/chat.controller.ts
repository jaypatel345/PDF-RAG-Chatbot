import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('ask')
  async askQuestion(@Body() body: { question: string; sessionId?: string }) {
    return this.chatService.askQuestion(body.question, body.sessionId);
  }

  @Get('history/:sessionId')
  async getChatHistory(@Param('sessionId') sessionId: string) {
    return this.chatService.getChatHistory(sessionId);
  }

  @Get('stats')
  async getChatStats() {
    return this.chatService.getChatStats();
  }
}
