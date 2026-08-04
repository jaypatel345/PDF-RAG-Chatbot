'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { chatAPI } from '@/lib/api';
import { ChatMessage } from '@/types';
import { Send, Bot, User, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate session ID on first load
    if (!sessionId) {
      setSessionId(Math.random().toString(36).substring(7));
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to chat
    const tempUserMessage: ChatMessage = {
      id: Date.now(),
      session_id: sessionId,
      question: userMessage,
      answer: '',
      source_document: null,
      page_number: null,
      suggested_questions: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await chatAPI.ask(userMessage, sessionId);
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        session_id: sessionId,
        question: userMessage,
        answer: response.answer,
        source_document: response.source_document,
        page_number: response.page_number,
        suggested_questions: response.suggested_questions || [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev.slice(0, -1), aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev.slice(0, -1)]);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Knowledge Base</h1>
              <p className="text-sm text-gray-600">Ask questions about uploaded documents</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4" style={{ minHeight: '500px' }}>
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Welcome to the AI Knowledge Base
                </h3>
                <p className="text-gray-500">
                  Ask any question about the uploaded PDF documents
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={message.id} className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <div className="flex items-start space-x-2">
                      <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{message.question}</p>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                {message.answer && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <div className="flex items-start space-x-2">
                        <Bot className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                        <div className="flex-1">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.answer}
                            </ReactMarkdown>
                          </div>

                          {/* Source Document */}
                          {message.source_document && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Source: {message.source_document}
                                {message.page_number && ` (Page ${message.page_number})`}
                              </Badge>
                            </div>
                          )}

                          {/* Suggested Questions */}
                          {message.suggested_questions && message.suggested_questions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-2">
                                Suggested Questions:
                              </p>
                              <div className="space-y-2">
                                {message.suggested_questions.map((question, idx) => (
                                  <Button
                                    key={idx}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                                    onClick={() => handleSuggestedQuestion(question)}
                                  >
                                    {question}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the documents..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
