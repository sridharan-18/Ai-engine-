/**
 * Conversation Template Manager
 * Manages conversation templates for quick starts
 */

import { ConversationTemplate, TemplateCategory } from './types';

export class TemplateManager {
  private templates: Map<string, ConversationTemplate> = new Map();
  private categories: Map<string, TemplateCategory> = new Map();

  constructor() {
    this.initializeBuiltInTemplates();
    this.initializeCategories();
  }

  private initializeBuiltInTemplates(): void {
    const builtInTemplates: ConversationTemplate[] = [
      {
        id: 'code-review',
        name: 'Code Review Assistant',
        description: 'Helps review and improve code quality',
        category: 'programming',
        systemPrompt: 'You are a code review assistant. Analyze code for bugs, performance issues, and best practices. Provide constructive feedback and suggest improvements.',
        initialMessages: [
          { role: 'user', content: 'Please review this code for me.' },
        ],
        tags: ['code', 'review', 'programming'],
        isPublic: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'writing-assistant',
        name: 'Writing Assistant',
        description: 'Helps with writing, editing, and proofreading',
        category: 'writing',
        systemPrompt: 'You are a writing assistant. Help users improve their writing by checking grammar, suggesting better word choices, and improving clarity and flow.',
        initialMessages: [
          { role: 'user', content: 'Can you help me improve this text?' },
        ],
        tags: ['writing', 'editing', 'grammar'],
        isPublic: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'research-helper',
        name: 'Research Helper',
        description: 'Assists with research and information gathering',
        category: 'research',
        systemPrompt: 'You are a research assistant. Help users find and organize information, cite sources, and structure research findings.',
        initialMessages: [
          { role: 'user', content: 'I need help researching a topic.' },
        ],
        tags: ['research', 'information', 'academic'],
        isPublic: true,
        createdAt: new Date().toISOString(),
      },
    ];

    builtInTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private initializeCategories(): void {
    const categories: TemplateCategory[] = [
      { id: 'programming', name: 'Programming', description: 'Code and development templates' },
      { id: 'writing', name: 'Writing', description: 'Writing and editing templates' },
      { id: 'research', name: 'Research', description: 'Research and academic templates' },
      { id: 'business', name: 'Business', description: 'Business and productivity templates' },
      { id: 'education', name: 'Education', description: 'Learning and teaching templates' },
    ];

    categories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  async createTemplate(template: Omit<ConversationTemplate, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const newTemplate: ConversationTemplate = {
      ...template,
      id,
      createdAt: new Date().toISOString(),
    };

    this.templates.set(id, newTemplate);
    return id;
  }

  async updateTemplate(id: string, updates: Partial<ConversationTemplate>): Promise<boolean> {
    const template = this.templates.get(id);
    if (!template) return false;

    const updated = { ...template, ...updates };
    this.templates.set(id, updated);
    return true;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  getTemplate(id: string): ConversationTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): ConversationTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): ConversationTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  searchTemplates(query: string): ConversationTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter(
      t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getCategories(): TemplateCategory[] {
    return Array.from(this.categories.values());
  }

  async duplicateTemplate(id: string): Promise<string | null> {
    const template = this.templates.get(id);
    if (!template) return null;

    const newTemplate: Omit<ConversationTemplate, 'id' | 'createdAt'> = {
      ...template,
      name: `${template.name} (Copy)`,
      isPublic: false,
    };

    return this.createTemplate(newTemplate);
  }
}

export const templateManager = new TemplateManager();
