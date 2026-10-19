/**
 * Milvus Vector Database Integration
 * Provides semantic search capabilities using Milvus
 */

export interface MilvusDocument {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export interface MilvusSearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

export class MilvusClient {
  private apiUrl: string | null = null;
  private collectionName: string = 'vane_documents';

  constructor(apiUrl?: string, collectionName?: string) {
    this.apiUrl = apiUrl || process.env.MILVUS_API_URL || null;
    this.collectionName = collectionName || process.env.MILVUS_COLLECTION_NAME || 'vane_documents';
  }

  async insert(documents: MilvusDocument[]): Promise<boolean> {
    if (!this.apiUrl) {
      console.warn('Milvus API URL not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/vectors/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName: this.collectionName,
          data: documents,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error inserting into Milvus:', error);
      return false;
    }
  }

  async search(vector: number[], topK: number = 10, filter?: string): Promise<MilvusSearchResult[]> {
    if (!this.apiUrl) {
      console.warn('Milvus API URL not configured');
      return [];
    }

    try {
      const body: any = {
        collectionName: this.collectionName,
        vector,
        limit: topK,
      };

      if (filter) {
        body.expr = filter;
      }

      const response = await fetch(`${this.apiUrl}/v1/vectors/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.data || []).map((item: any) => ({
        id: item.id,
        score: item.score,
        metadata: item.metadata || {},
      }));
    } catch (error) {
      console.error('Error searching Milvus:', error);
      return [];
    }
  }

  async delete(ids: string[]): Promise<boolean> {
    if (!this.apiUrl) {
      console.warn('Milvus API URL not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/vectors/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName: this.collectionName,
          ids,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting from Milvus:', error);
      return false;
    }
  }

  async createCollection(dimension: number): Promise<boolean> {
    if (!this.apiUrl) {
      console.warn('Milvus API URL not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName: this.collectionName,
          dimension,
          metricType: 'COSINE',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating collection in Milvus:', error);
      return false;
    }
  }
}

export const milvusClient = new MilvusClient();
