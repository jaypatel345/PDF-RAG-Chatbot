export interface User {
  id: number;
  email: string;
}

export interface Document {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  page_count: number | null;
  processing_status: string;
  error_message: string | null;
  upload_date: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  question: string;
  answer: string;
  source_document: string | null;
  page_number: number | null;
  suggested_questions: string[];
  created_at: string;
}

export interface DashboardStats {
  totalPDFs: number;
  processedPDFs: number;
  pendingPDFs: number;
  recentDocuments: Document[];
}

export interface ChatStats {
  totalChats: number;
  totalSessions: number;
}
