# Search & Knowledge Expansion Features

This document describes the new integrations for academic research, Indian government data sources, and vector database support.

## 1. Academic Integrations

### Overview
Integrated with three major academic databases to provide research-heavy users with access to scholarly papers and citations.

### Supported Platforms

#### arXiv
- **API**: http://export.arxiv.org/api/query
- **Features**:
  - Search papers by title, abstract, or keywords
  - Get paper details including authors, categories, and publication date
  - Access PDF links for full papers
- **Usage**:
  ```typescript
  import { arxivClient } from '@/lib/integrations/academic';
  
  const papers = await arxivClient.searchPapers('machine learning', 10);
  ```

#### PubMed
- **API**: https://eutils.ncbi.nlm.nih.gov/entrez/eutils
- **Features**:
  - Search biomedical and life sciences literature
  - Get paper abstracts
  - Access publication details and DOIs
  - Requires API key for higher rate limits
- **Usage**:
  ```typescript
  import { pubmedClient } from '@/lib/integrations/academic';
  
  const papers = await pubmedClient.searchPapers('cancer immunotherapy', 10);
  ```

#### Semantic Scholar
- **API**: https://api.semanticscholar.org/graph/v1
- **Features**:
  - AI-powered semantic search
  - Citation counts and influential citation metrics
  - Reference and citation graph traversal
  - Open access PDF links
- **Usage**:
  ```typescript
  import { semanticScholarClient } from '@/lib/integrations/academic';
  
  const papers = await semanticScholarClient.searchPapers('deep learning', 10);
  ```

### Unified Academic Search
The `AcademicSearchEngine` class provides a unified interface to search across all three platforms:

```typescript
import { academicSearchEngine } from '@/lib/integrations/academic';

// Search all sources
const results = await academicSearchEngine.searchAll('quantum computing', 5);

// Search specific source
const arxivResults = await academicSearchEngine.searchArxiv('neural networks', 10);
```

### Configuration
Set the following environment variables for enhanced functionality:
- `PUBMED_API_KEY`: Your NCBI API key for PubMed (optional but recommended)
- `SEMANTIC_SCHOLAR_API_KEY`: Your Semantic Scholar API key (optional)

## 2. Indian Government Data Sources

### Overview
Integrated with Indian government portals to provide region-specific data for weather, agriculture, and transport queries.

### Supported Data Sources

#### Weather Data
- **Source**: OpenWeatherMap API with Indian city focus
- **Features**:
  - Current weather for Indian cities
  - 5-day weather forecasts
  - Major cities weather overview
  - Temperature, humidity, wind speed, and conditions
- **Supported Cities**: Delhi, Mumbai, Chennai, Kolkata, Bangalore, Hyderabad, Pune, Ahmedabad
- **Usage**:
  ```typescript
  import { indianWeatherService } from '@/lib/integrations/indian';
  
  const weather = await indianWeatherService.getCurrentWeather('Chennai');
  const forecast = await indianWeatherService.getForecast('Mumbai', 5);
  ```

#### Agriculture Data
- **Source**: AGMARKNET (Agricultural Marketing Information Network)
- **Features**:
  - Crop information (season, sowing/harvesting times, duration)
  - Regional crop data
  - Market prices from APMC mandis
  - Commodity price trends
- **Supported Crops**: Rice, Wheat, Cotton, and more
- **Usage**:
  ```typescript
  import { indianAgricultureService } from '@/lib/integrations/indian';
  
  const cropInfo = await indianAgricultureService.getCropInfo('rice');
  const prices = await indianAgricultureService.getMarketPrices('Punjab');
  ```

#### Transport Data
- **Source**: Indian Railways and airline APIs
- **Features**:
  - Train schedules and status
  - Flight status information
  - Route information
  - Real-time updates
- **Usage**:
  ```typescript
  import { indianTransportService } from '@/lib/integrations/indian';
  
  const trainSchedule = await indianTransportService.getTrainSchedule('12301');
  const flightStatus = await indianTransportService.getFlightStatus('AI302');
  ```

### Unified Indian Data Search
The `IndianDataService` class provides intelligent query routing:

```typescript
import { indianDataService } from '@/lib/integrations/indian';

// Automatically detects query type and routes to appropriate service
const results = await indianDataService.search('weather in Chennai');
const results = await indianDataService.search('rice crop information');
const results = await indianDataService.search('train 12301 status');
```

### Configuration
Set the following environment variable:
- `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key for weather data

### Note on Production Integration
The current implementation includes mock data for agriculture and transport services. In production, integrate with:
- **AGMARKNET API**: https://agmarknet.gov.in for real-time market prices
- **Indian Railways API**: https://www.indianrail.gov.in for train data
- **Airline APIs**: Individual airline APIs for flight status

## 3. Vector Database Support

### Overview
Integrated with three major vector database providers to enable semantic search across uploaded documents.

### Supported Vector Databases

#### Pinecone
- **Features**:
  - Managed vector database service
  - High-performance similarity search
  - Automatic scaling
  - Metadata filtering
- **Configuration**:
  ```typescript
  import { pineconeClient } from '@/lib/vector/pinecone';
  
  const client = new PineconeClient(
    process.env.PINECONE_API_KEY,
    process.env.PINECONE_ENVIRONMENT,
    'vane-documents'
  );
  ```

#### Weaviate
- **Features**:
  - Open-source vector database
  - GraphQL API
  - Schema flexibility
  - Hybrid search capabilities
- **Configuration**:
  ```typescript
  import { weaviateClient } from '@/lib/vector/weaviate';
  
  const client = new WeaviateClient(
    process.env.WEAVIATE_API_URL,
    process.env.WEAVIATE_API_KEY
  );
  ```

#### Milvus
- **Features**:
  - Open-source vector database
  - High scalability
  - Multiple index types
  - Cloud-native architecture
- **Configuration**:
  ```typescript
  import { milvusClient } from '@/lib/vector/milvus';
  
  const client = new MilvusClient(
    process.env.MILVUS_API_URL,
    'vane_documents'
  );
  ```

### Unified Vector Database Manager
The `VectorDBManager` class provides a unified interface for all vector databases:

```typescript
import { vectorDBManager } from '@/lib/vector';

// Set active database
vectorDBManager.setActiveDB('pinecone');

// Index documents
await vectorDBManager.indexDocument({
  id: 'doc-1',
  content: 'Document content here',
  metadata: { source: 'pdf', author: 'John' }
}, embeddingModel);

// Search documents
const results = await vectorDBManager.search('search query', embeddingModel, 10);

// Search within specific uploaded files
const fileResults = await vectorDBManager.searchUploadedDocuments(
  'query',
  ['file-id-1', 'file-id-2'],
  embeddingModel,
  10
);
```

### Document Indexing Workflow
1. User uploads a document (PDF, text, etc.)
2. Document is chunked into smaller segments
3. Each chunk is converted to an embedding using the configured embedding model
4. Embeddings are stored in the active vector database with metadata
5. When user queries, the query is embedded and similar chunks are retrieved

### Configuration
Set the appropriate environment variables for your chosen vector database:

**For Pinecone**:
- `PINECONE_API_KEY`: Your Pinecone API key
- `PINECONE_ENVIRONMENT`: Your Pinecone environment (e.g., 'us-east-1-aws')
- `PINECONE_INDEX_NAME`: Your index name (default: 'vane-documents')

**For Weaviate**:
- `WEAVIATE_API_URL`: Your Weaviate instance URL
- `WEAVIATE_API_KEY`: Your Weaviate API key (if required)

**For Milvus**:
- `MILVUS_API_URL`: Your Milvus instance URL
- `MILVUS_COLLECTION_NAME`: Your collection name (default: 'vane_documents')

### Integration with Search Agent
The vector database can be integrated with the existing search agent to enhance document-based queries:

```typescript
// In the search agent, when file uploads are present
if (fileIds.length > 0) {
  const vectorResults = await vectorDBManager.searchUploadedDocuments(
    query,
    fileIds,
    embeddingModel,
    5
  );
  
  // Use vector results as additional context for the LLM
}
```

## Usage Examples

### Academic Research Query
```
User: "Find recent papers on transformer architectures in NLP"
System: Searches arXiv, PubMed, and Semantic Scholar
Result: Returns top 5 papers with titles, authors, and abstracts
```

### Indian Weather Query
```
User: "What's the weather like in Bangalore?"
System: Queries Indian weather service
Result: Current temperature, humidity, and conditions
```

### Agriculture Query
```
User: "Tell me about rice cultivation in India"
System: Queries agriculture database
Result: Season, sowing time, harvesting time, and major regions
```

### Document Semantic Search
```
User: Uploads a research paper
User: "What does the paper say about experimental results?"
System: Embeds query, searches vector database
Result: Relevant sections from the uploaded paper
```

## Performance Considerations

### Academic Integrations
- Rate limits apply to all APIs
- Implement caching for frequently accessed papers
- Use API keys to increase rate limits where available

### Indian Data Sources
- Weather data has minimal latency
- Agriculture and transport data may require API integration for real-time data
- Consider implementing local caching for frequently accessed data

### Vector Databases
- Indexing time depends on document size and embedding model
- Search latency is typically <100ms for most vector databases
- Consider batch indexing for large document sets
- Implement periodic cleanup of old or unused vectors

## Security Considerations

- Store API keys in environment variables, never in code
- Implement rate limiting for external API calls
- Validate user inputs before passing to external APIs
- Use HTTPS for all API communications
- Implement proper error handling for API failures

## Future Enhancements

### Academic Integrations
- Add more academic databases (Google Scholar, IEEE Xplore)
- Implement citation graph visualization
- Add paper recommendation system
- Support for full-text search within papers

### Indian Data Sources
- Integrate with real AGMARKNET API for live market prices
- Add more government portals (education, health, finance)
- Implement data visualization for weather and agriculture data
- Add support for regional languages in responses

### Vector Databases
- Add support for more vector databases (Qdrant, Chroma)
- Implement hybrid search (keyword + semantic)
- Add document deduplication
- Implement automatic vector database migration
- Add support for multimodal embeddings (text + images)

## Troubleshooting

### Academic Integrations
- **Issue**: Rate limit errors
  - **Solution**: Implement exponential backoff and caching
- **Issue**: No results found
  - **Solution**: Try broader search terms or different databases

### Indian Data Sources
- **Issue**: Weather data not loading
  - **Solution**: Check OPENWEATHER_API_KEY is set correctly
- **Issue**: Mock data returned
  - **Solution**: Integrate with actual government APIs

### Vector Databases
- **Issue**: Connection refused
  - **Solution**: Verify API URL and credentials
- **Issue**: Slow search performance
  - **Solution**: Check vector database indexing and consider increasing replicas
- **Issue**: Poor search results
  - **Solution**: Verify embedding model quality and consider chunking strategy

## Conclusion

These integrations significantly expand Vane's capabilities by:
- Providing access to academic research for scholarly queries
- Offering region-specific data for Indian users
- Enabling semantic search across uploaded documents

All implementations follow the existing codebase patterns and are designed to be easily extended with additional data sources and vector databases.
