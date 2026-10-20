/**
 * Model Benchmark Types
 * Defines types for model performance benchmarking
 */

export type ModelProvider = 'openai' | 'claude' | 'gemini' | 'groq' | 'ollama' | 'local';

export interface BenchmarkMetrics {
  latency: number; // Average response time in milliseconds
  throughput: number; // Requests per second
  accuracy?: number; // Accuracy score (0-1) if applicable
  costPer1kTokens: number; // Cost per 1,000 tokens in USD
  memoryUsage?: number; // Memory usage in MB for local models
  vramUsage?: number; // VRAM usage in MB for local models
}

export interface ModelBenchmark {
  id: string;
  modelId: string; // Alias for easier identification
  provider: ModelProvider;
  modelName: string;
  metrics: BenchmarkMetrics;
  timestamp: string;
  testPrompt: string;
  responseLength: number;
}

export interface BenchmarkConfig {
  providers: ModelProvider[];
  testPrompts: string[];
  iterations: number;
  includeLocalModels: boolean;
}

export interface BenchmarkComparison {
  provider: ModelProvider;
  modelName: string;
  metrics: BenchmarkMetrics;
  rank: {
    latency: number;
    throughput: number;
    cost: number;
    overall: number;
  };
}

export interface BenchmarkHistory {
  modelId: string;
  benchmarks: ModelBenchmark[];
  averageMetrics: BenchmarkMetrics;
  trend: 'improving' | 'declining' | 'stable';
}
