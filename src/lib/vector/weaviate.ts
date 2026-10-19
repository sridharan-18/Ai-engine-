/**
 * Weaviate Vector Database Integration
 * Provides semantic search capabilities using Weaviate
 */

export interface WeaviateObject {
  id?: string;
  class: string;
  properties: Record<string, any>;
  vector?: number[];
}

export interface WeaviateSearchResult {
  id: string;
  properties: Record<string, any>;
  score: number;
}

export class WeaviateClient {
  private apiUrl: string | null = null;
  private apiKey: string | null = null;

  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl || process.env.WEAVIATE_API_URL || null;
    this.apiKey = apiKey || process.env.WEAVIATE_API_KEY || null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  async createObject(obj: WeaviateObject): Promise<string | null> {
    if (!this.apiUrl) {
      console.warn('Weaviate API URL not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/objects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(obj),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.id || null;
    } catch (error) {
      console.error('Error creating object in Weaviate:', error);
      return null;
    }
  }

  async search(
    className: string,
    query: string,
    properties: string[],
    limit: number = 10,
    certainty: number = 0.7
  ): Promise<WeaviateSearchResult[]> {
    if (!this.apiUrl) {
      console.warn('Weaviate API URL not configured');
      return [];
    }

    try {
      const body = {
        nearText: {
          concepts: [query],
          certainty,
        },
        className,
        properties,
        limit,
      };

      const response = await fetch(`${this.apiUrl}/objects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.data?.Get?.[className] || []).map((item: any) => ({
        id: item._additional.id,
        properties: item,
        score: item._additional.certainty || 0,
      }));
    } catch (error) {
      console.error('Error searching Weaviate:', error);
      return [];
    }
  }

  async searchWithVector(
    className: string,
    vector: number[],
    properties: string[],
    limit: number = 10
  ): Promise<WeaviateSearchResult[]> {
    if (!this.apiUrl) {
      console.warn('Weaviate API URL not configured');
      return [];
    }

    try {
      const body = {
        nearVector: {
          vector,
        },
        className,
        properties,
        limit,
      };

      const response = await fetch(`${this.apiUrl}/objects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.data?.Get?.[className] || []).map((item: any) => ({
        id: item._additional.id,
        properties: item,
        score: item._additional.distance || 0,
      }));
    } catch (error) {
      console.error('Error searching Weaviate with vector:', error);
      return [];
    }
  }

  async deleteObject(id: string, className: string): Promise<boolean> {
    if (!this.apiUrl) {
      console.warn('Weaviate API URL not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/objects/${className}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting object from Weaviate:', error);
      return false;
    }
  }
}

export const weaviateClient = new WeaviateClient();
