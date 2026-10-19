/**
 * Semantic Scholar API Integration
 * Fetches academic papers with AI-powered semantic search
 */

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract?: string;
  authors: Array<{ name: string; authorId?: string }>;
  year?: number;
  venue?: string;
  publicationDate?: string;
  citationCount?: number;
  influentialCitationCount?: number;
  url?: string;
  openAccessPdf?: { url: string };
}

export class SemanticScholarClient {
  private baseUrl = 'https://api.semanticscholar.org/graph/v1';
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SEMANTIC_SCHOLAR_API_KEY || null;
  }

  async searchPapers(query: string, limit: number = 10, fields: string[] = ['paperId', 'title', 'abstract', 'authors', 'year', 'venue', 'publicationDate', 'citationCount', 'influentialCitationCount', 'url', 'openAccessPdf']): Promise<SemanticScholarPaper[]> {
    try {
      const url = new URL(`${this.baseUrl}/paper/search`);
      url.searchParams.append('query', query);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('fields', fields.join(','));
      
      if (this.apiKey) {
        url.searchParams.append('apiKey', this.apiKey);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      return data.data || [];
    } catch (error) {
      console.error('Error fetching from Semantic Scholar:', error);
      return [];
    }
  }

  async getPaperById(paperId: string): Promise<SemanticScholarPaper | null> {
    try {
      const fields = ['paperId', 'title', 'abstract', 'authors', 'year', 'venue', 'publicationDate', 'citationCount', 'influentialCitationCount', 'url', 'openAccessPdf', 'references', 'citations'];
      
      const url = new URL(`${this.baseUrl}/paper/${paperId}`);
      url.searchParams.append('fields', fields.join(','));
      
      if (this.apiKey) {
        url.searchParams.append('apiKey', this.apiKey);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching paper from Semantic Scholar:', error);
      return null;
    }
  }

  async getCitations(paperId: string, limit: number = 20): Promise<SemanticScholarPaper[]> {
    try {
      const url = new URL(`${this.baseUrl}/paper/${paperId}/citations`);
      url.searchParams.append('limit', limit.toString());
      
      if (this.apiKey) {
        url.searchParams.append('apiKey', this.apiKey);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      return data.data || [];
    } catch (error) {
      console.error('Error fetching citations from Semantic Scholar:', error);
      return [];
    }
  }

  async getReferences(paperId: string, limit: number = 20): Promise<SemanticScholarPaper[]> {
    try {
      const url = new URL(`${this.baseUrl}/paper/${paperId}/references`);
      url.searchParams.append('limit', limit.toString());
      
      if (this.apiKey) {
        url.searchParams.append('apiKey', this.apiKey);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      return data.data || [];
    } catch (error) {
      console.error('Error fetching references from Semantic Scholar:', error);
      return [];
    }
  }
}

export const semanticScholarClient = new SemanticScholarClient();
