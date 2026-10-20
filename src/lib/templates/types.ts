/**
 * Conversation Template Types
 */

export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  systemPrompt: string;
  initialMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  author?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}
