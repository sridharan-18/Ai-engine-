/**
 * PubMed API Integration
 * Fetches biomedical and life sciences literature from PubMed
 */

export interface PubMedPaper {
  pmid: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: string;
  journal: string;
  doi?: string;
}

export class PubMedClient {
  private baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PUBMED_API_KEY || null;
  }

  async searchPapers(query: string, maxResults: number = 10): Promise<PubMedPaper[]> {
    try {
      // Step 1: Search for PMIDs
      const searchUrl = `${this.baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json${this.apiKey ? `&api_key=${this.apiKey}` : ''}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      const idList = searchData.esearchresult?.idlist || [];
      if (idList.length === 0) return [];

      // Step 2: Fetch details for each PMID
      const ids = idList.join(',');
      const summaryUrl = `${this.baseUrl}/esummary.fcgi?db=pubmed&id=${ids}&retmode=json${this.apiKey ? `&api_key=${this.apiKey}` : ''}`;
      
      const summaryResponse = await fetch(summaryUrl);
      const summaryData = await summaryResponse.json();

      return this.parsePubMedResponse(summaryData);
    } catch (error) {
      console.error('Error fetching from PubMed:', error);
      return [];
    }
  }

  private parsePubMedResponse(data: any): PubMedPaper[] {
    const papers: PubMedPaper[] = [];
    const result = data.result;

    if (!result) return papers;

    Object.keys(result).forEach((uid) => {
      if (uid === 'uids') return;

      const item = result[uid];
      papers.push({
        pmid: uid,
        title: item.title || '',
        authors: item.authors?.map((a: any) => a.name) || [],
        abstract: '', // Abstracts require separate fetch with efetch
        publicationDate: item.pubdate || '',
        journal: item.source || '',
        doi: item.elocationid || undefined,
      });
    });

    return papers;
  }

  async getAbstract(pmid: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text${this.apiKey ? `&api_key=${this.apiKey}` : ''}`;
      
      const response = await fetch(url);
      const text = await response.text();
      
      // Extract abstract from text response
      const abstractMatch = text.match(/ABSTRACT\s*([\s\S]*?)(?=\n\n|$)/);
      return abstractMatch ? abstractMatch[1].trim() : '';
    } catch (error) {
      console.error('Error fetching abstract from PubMed:', error);
      return '';
    }
  }
}

export const pubmedClient = new PubMedClient();
