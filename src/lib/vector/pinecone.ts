/**
 * Pinecone Vector Database Integration
 * Provides semantic search capabilities using Pinecone
 */

export interface VectorDocument {
  id: string;
  values: number[];
  metadata: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

export class PineconeClient {
  private apiKey: string | null = null;
  private environment: string | null = null;
  private indexName: string = 'vane-documents';
  private baseUrl: string = '';

  constructor(apiKey?: string, environment?: string, indexName?: string) {
    this.apiKey = apiKey || process.env.PINECONE_API_KEY || null;
    this.environment = environment || process.env.PINECONE_ENVIRONMENT || null;
    this.indexName = indexName || process.env.PINECONE_INDEX_NAME || 'vane-documents';
    
    if (this.apiKey && this.environment) {
      this.baseUrl = `https://${this.environment}-${this.indexName}.svc.${this.environment}.pinecone.io`;
    }
  }

  async upsert(vectors: VectorDocument[]): Promise<boolean> {
    if (!this.apiKey || !this.environment) {
      console.warn('Pinecone API key or environment not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vectors }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error upserting to Pinecone:', error);
      return false;
    }
  }

  async query(vector: number[], topK: number = 10, filter?: Record<string, any>): Promise<SearchResult[]> {
    if (!this.apiKey || !this.environment) {
      console.warn('Pinecone API key or environment not configured');
      return [];
    }

    try {
      const body: any = {
        vector,
        topK,
        includeMetadata: true,
      };

      if (filter) {
        body.filter = filter;
      }

      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      return [];
    }
  }

  async delete(ids: string[]): Promise<boolean> {
    if (!this.apiKey || !this.environment) {
      console.warn('Pinecone API key or environment not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/vectors/delete`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting from Pinecone:', error);
      return false;
    }
  }

  async searchByText(query: string, embeddingModel: any, topK: number = 10): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query text
      const embedding = await embeddingModel.embed(query);
      
      return this.query(embedding, topK);
    } catch (error) {
      console.error('Error searching by text in Pinecone:', error);
      return [];
    }
  }
}

export const pineconeClient = new PineconeClient();
