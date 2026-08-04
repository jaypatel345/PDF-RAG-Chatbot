// Shared types between backend and frontend

export interface RedisMessage {
  requestId?: string;
  documentId?: number;
  filePath?: string;
  filename?: string;
  question?: string;
  sessionId?: string;
  answer?: string;
  sourceDocument?: string;
  pageNumber?: number;
  suggestedQuestions?: string[];
  error?: string;
}

export interface ChatRequest extends RedisMessage {
  requestId: string;
  question: string;
  sessionId: string;
}

export interface ChatResponse extends RedisMessage {
  requestId: string;
  answer: string;
  sourceDocument: string;
  pageNumber: number;
  suggestedQuestions: string[];
}

export interface PDFUploadMessage extends RedisMessage {
  documentId: number;
  filePath: string;
  filename: string;
}

export interface PDFDeleteMessage extends RedisMessage {
  documentId: number;
  filename: string;
}
