/**
 * Vector Database Manager
 * Unified interface for managing vector databases (Pinecone, Weaviate, Milvus)
 */

import { pineconeClient, VectorDocument as PineconeDocument, SearchResult as PineconeResult } from './pinecone';
import { weaviateClient, WeaviateObject, WeaviateSearchResult } from './weaviate';
import { milvusClient, MilvusDocument, MilvusSearchResult } from './milvus';

export type VectorDBType = 'pinecone' | 'weaviate' | 'milvus';

export interface UnifiedDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface UnifiedSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export class VectorDBManager {
  private activeDB: VectorDBType = 'pinecone';

  setActiveDB(db: VectorDBType) {
    this.activeDB = db;
  }

  async indexDocument(document: UnifiedDocument, embeddingModel: any): Promise<boolean> {
    const embedding = document.embedding || await embeddingModel.embed(document.content);

    switch (this.activeDB) {
      case 'pinecone':
        const pineconeDoc: PineconeDocument = {
          id: document.id,
          values: embedding,
          metadata: {
            content: document.content,
            ...document.metadata,
          },
        };
        return pineconeClient.upsert([pineconeDoc]);

      case 'weaviate':
        const weaviateObj: WeaviateObject = {
          class: 'Document',
          properties: {
            content: document.content,
            ...document.metadata,
          },
          vector: embedding,
        };
        return (await weaviateClient.createObject(weaviateObj)) !== null;

      case 'milvus':
        const milvusDoc: MilvusDocument = {
          id: document.id,
          vector: embedding,
          metadata: {
            content: document.content,
            ...document.metadata,
          },
        };
        return milvusClient.insert([milvusDoc]);

      default:
        return false;
    }
  }

  async indexDocuments(documents: UnifiedDocument[], embeddingModel: any): Promise<boolean> {
    const results = await Promise.all(
      documents.map(doc => this.indexDocument(doc, embeddingModel))
    );
    return results.every(r => r);
  }

  async search(query: string, embeddingModel: any, topK: number = 10): Promise<UnifiedSearchResult[]> {
    const embedding = await embeddingModel.embed(query);

    switch (this.activeDB) {
      case 'pinecone':
        const pineconeResults = await pineconeClient.query(embedding, topK);
        return pineconeResults.map(r => ({
          id: r.id,
          content: r.metadata.content || '',
          score: r.score,
          metadata: r.metadata,
        }));

      case 'weaviate':
        const weaviateResults = await weaviateClient.searchWithVector('Document', embedding, ['content', '*'], topK);
        return weaviateResults.map(r => ({
          id: r.id,
          content: r.properties.content || '',
          score: r.score,
          metadata: r.properties,
        }));

      case 'milvus':
        const milvusResults = await milvusClient.search(embedding, topK);
        return milvusResults.map(r => ({
          id: r.id,
          content: r.metadata.content || '',
          score: r.score,
          metadata: r.metadata,
        }));

      default:
        return [];
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    switch (this.activeDB) {
      case 'pinecone':
        return pineconeClient.delete([id]);

      case 'weaviate':
        return weaviateClient.deleteObject(id, 'Document');

      case 'milvus':
        return milvusClient.delete([id]);

      default:
        return false;
    }
  }

  async deleteDocuments(ids: string[]): Promise<boolean> {
    const results = await Promise.all(
      ids.map(id => this.deleteDocument(id))
    );
    return results.every(r => r);
  }

  async searchUploadedDocuments(query: string, fileIds: string[], embeddingModel: any, topK: number = 10): Promise<UnifiedSearchResult[]> {
    // Add filter for specific file IDs
    const embedding = await embeddingModel.embed(query);

    switch (this.activeDB) {
      case 'pinecone':
        const filter = { fileId: { $in: fileIds } };
        const pineconeResults = await pineconeClient.query(embedding, topK, filter);
        return pineconeResults.map(r => ({
          id: r.id,
          content: r.metadata.content || '',
          score: r.score,
          metadata: r.metadata,
        }));

      case 'weaviate':
        const weaviateResults = await weaviateClient.searchWithVector('Document', embedding, ['content', '*'], topK);
        return weaviateResults
          .filter(r => fileIds.includes(r.properties.fileId))
          .map(r => ({
            id: r.id,
            content: r.properties.content || '',
            score: r.score,
            metadata: r.properties,
          }));

      case 'milvus':
        const filterExpr = fileIds.map(id => `fileId == "${id}"`).join(' || ');
        const milvusResults = await milvusClient.search(embedding, topK, filterExpr);
        return milvusResults.map(r => ({
          id: r.id,
          content: r.metadata.content || '',
          score: r.score,
          metadata: r.metadata,
        }));

      default:
        return [];
    }
  }
}

export const vectorDBManager = new VectorDBManager();
