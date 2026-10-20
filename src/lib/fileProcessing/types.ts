/**
 * File Processing Types
 */

export interface FileProcessResult {
  success: boolean;
  text?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language?: string;
}

export interface DocumentParseResult {
  title?: string;
  author?: string;
  content: string;
  metadata: {
    pages: number;
    wordCount: number;
    language?: string;
    creationDate?: string;
  };
}
