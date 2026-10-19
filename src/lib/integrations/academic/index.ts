/**
 * Academic Search Integration
 * Unified interface for searching across multiple academic databases
 */

import { arxivClient, ArxivPaper } from './arxiv';
import { pubmedClient, PubMedPaper } from './pubmed';
import { semanticScholarClient, SemanticScholarPaper } from './semanticScholar';

export interface AcademicResult {
  source: 'arxiv' | 'pubmed' | 'semanticScholar';
  data: ArxivPaper | PubMedPaper | SemanticScholarPaper;
  relevanceScore?: number;
}

export class AcademicSearchEngine {
  async searchAll(query: string, maxResults: number = 5): Promise<AcademicResult[]> {
    const results: AcademicResult[] = [];

    // Search all sources in parallel
    const [arxivResults, pubmedResults, semanticResults] = await Promise.all([
      arxivClient.searchPapers(query, maxResults),
      pubmedClient.searchPapers(query, maxResults),
      semanticScholarClient.searchPapers(query, maxResults),
    ]);

    arxivResults.forEach(paper => {
      results.push({ source: 'arxiv', data: paper });
    });

    pubmedResults.forEach(paper => {
      results.push({ source: 'pubmed', data: paper });
    });

    semanticResults.forEach(paper => {
      results.push({ source: 'semanticScholar', data: paper });
    });

    // Sort by relevance (simple implementation - could be improved with ML)
    return results.slice(0, maxResults * 3);
  }

  async searchArxiv(query: string, maxResults: number = 10): Promise<AcademicResult[]> {
    const papers = await arxivClient.searchPapers(query, maxResults);
    return papers.map(paper => ({ source: 'arxiv' as const, data: paper }));
  }

  async searchPubMed(query: string, maxResults: number = 10): Promise<AcademicResult[]> {
    const papers = await pubmedClient.searchPapers(query, maxResults);
    return papers.map(paper => ({ source: 'pubmed' as const, data: paper }));
  }

  async searchSemanticScholar(query: string, maxResults: number = 10): Promise<AcademicResult[]> {
    const papers = await semanticScholarClient.searchPapers(query, maxResults);
    return papers.map(paper => ({ source: 'semanticScholar' as const, data: paper }));
  }

  formatResult(result: AcademicResult): string {
    const { source, data } = result;

    if (source === 'arxiv') {
      const paper = data as ArxivPaper;
      return `[arXiv] ${paper.title}\nAuthors: ${paper.authors.join(', ')}\nPublished: ${paper.published}\nCategories: ${paper.categories.join(', ')}\n${paper.summary}`;
    }

    if (source === 'pubmed') {
      const paper = data as PubMedPaper;
      return `[PubMed] ${paper.title}\nAuthors: ${paper.authors.join(', ')}\nJournal: ${paper.journal}\nPublished: ${paper.publicationDate}\nPMID: ${paper.pmid}`;
    }

    if (source === 'semanticScholar') {
      const paper = data as SemanticScholarPaper;
      return `[Semantic Scholar] ${paper.title}\nAuthors: ${paper.authors.map(a => a.name).join(', ')}\nVenue: ${paper.venue || 'N/A'}\nYear: ${paper.year || 'N/A'}\nCitations: ${paper.citationCount || 0}`;
    }

    return '';
  }
}

export const academicSearchEngine = new AcademicSearchEngine();
