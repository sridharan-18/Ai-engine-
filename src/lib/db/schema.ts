import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { Block } from '../types';
import { SearchSources } from '../agents/search/types';

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  messageId: text('messageId').notNull(),
  chatId: text('chatId').notNull(),
  backendId: text('backendId').notNull(),
  query: text('query').notNull(),
  createdAt: text('createdAt').notNull(),
  responseBlocks: text('responseBlocks', { mode: 'json' })
    .$type<Block[]>()
    .default(sql`'[]'`),
  status: text({ enum: ['answering', 'completed', 'error'] }).default(
    'answering',
  ),
});

interface DBFile {
  name: string;
  fileId: string;
}

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  sources: text('sources', {
    mode: 'json',
  })
    .$type<SearchSources[]>()
    .default(sql`'[]'`),
  files: text('files', { mode: 'json' })
    .$type<DBFile[]>()
    .default(sql`'[]'`),
});

export const customAgents = sqliteTable('customAgents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  systemInstructions: text('systemInstructions').notNull(),
  preferredModel: text('preferredModel').notNull(),
  preferredMode: text('preferredMode', { enum: ['speed', 'balanced', 'quality'] }).default('balanced'),
  createdAt: text('createdAt').notNull(),
  context: text('context', { mode: 'json' }).default(sql`'{}'`),
});

export const queryCache = sqliteTable('queryCache', {
  id: text('id').primaryKey(),
  query: text('query').notNull(),
  response: text('response', { mode: 'json' }).notNull(),
  createdAt: text('createdAt').notNull(),
  lastAccessed: text('lastAccessed').notNull(),
});
