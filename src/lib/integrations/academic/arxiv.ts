/**
 * arXiv API Integration
 * Fetches academic papers from arXiv for research-heavy queries
 */

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  categories: string[];
  pdfUrl: string;
}

export class ArxivClient {
  private baseUrl = 'http://export.arxiv.org/api/query';

  async searchPapers(query: string, maxResults: number = 10): Promise<ArxivPaper[]> {
    try {
      const searchQuery = encodeURIComponent(
        `all:${query} OR ti:${query} OR abs:${query}`
      );
      const url = `${this.baseUrl}?search_query=${searchQuery}&start=0&max_results=${maxResults}`;

      const response = await fetch(url);
      const text = await response.text();

      return this.parseArxivResponse(text);
    } catch (error) {
      console.error('Error fetching from arXiv:', error);
      return [];
    }
  }

  private parseArxivResponse(xmlText: string): ArxivPaper[] {
    const papers: ArxivPaper[] = [];
    
    // Simple XML parsing - in production, use a proper XML parser
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    while ((match = entryRegex.exec(xmlText)) !== null) {
      const entry = match[1];
      
      const idMatch = entry.match(/<id>(.*?)<\/id>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      const pdfMatch = entry.match(/<link[^>]*href="([^"]*pdf[^"]*)"[^>]*\/>/);
      
      const authors: string[] = [];
      const authorRegex = /<name>(.*?)<\/name>/g;
      let authorMatch;
      while ((authorMatch = authorRegex.exec(entry)) !== null) {
        authors.push(authorMatch[1]);
      }

      const categories: string[] = [];
      const categoryRegex = /<term>(.*?)<\/term>/g;
      let categoryMatch;
      while ((categoryMatch = categoryRegex.exec(entry)) !== null) {
        categories.push(categoryMatch[1]);
      }

      if (idMatch && titleMatch) {
        papers.push({
          id: idMatch[1].split('/').pop() || idMatch[1],
          title: titleMatch[1].trim(),
          authors,
          summary: summaryMatch ? summaryMatch[1].trim() : '',
          published: publishedMatch ? publishedMatch[1] : '',
          categories,
          pdfUrl: pdfMatch ? pdfMatch[1] : '',
        });
      }
    }

    return papers;
  }

  async getPaperById(id: string): Promise<ArxivPaper | null> {
    const papers = await this.searchPapers(`id:${id}`, 1);
    return papers.length > 0 ? papers[0] : null;
  }
}

export const arxivClient = new ArxivClient();
