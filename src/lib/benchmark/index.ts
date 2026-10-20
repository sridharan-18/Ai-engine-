/**
 * Model Benchmark Manager
 * Unified interface for model performance benchmarking
 */

import { benchmarkRunner } from './runner';
import { benchmarkAnalyzer } from './analyzer';
import { ModelBenchmark, BenchmarkConfig, BenchmarkComparison } from './types';

export class BenchmarkManager {
  async runQuickBenchmark(): Promise<BenchmarkComparison[]> {
    const config: BenchmarkConfig = {
      providers: ['openai', 'claude', 'gemini', 'groq'],
      testPrompts: [
        'What is the capital of France?',
        'Explain quantum computing in simple terms.',
        'Write a short poem about technology.',
      ],
      iterations: 3,
      includeLocalModels: false,
    };

    const benchmarks = await benchmarkRunner.runFullBenchmark(config);
    return benchmarkAnalyzer.compareBenchmarks(benchmarks);
  }

  async runCustomBenchmark(config: BenchmarkConfig): Promise<BenchmarkComparison[]> {
    const benchmarks = await benchmarkRunner.runFullBenchmark(config);
    return benchmarkAnalyzer.compareBenchmarks(benchmarks);
  }

  async runSingleProviderBenchmark(
    provider: string,
    modelName: string,
    testPrompt: string
  ): Promise<ModelBenchmark> {
    return benchmarkRunner.runBenchmark(provider as any, modelName, testPrompt, 5);
  }

  getRecommendations(comparisons: BenchmarkComparison[]): string[] {
    return benchmarkAnalyzer.getRecommendations(comparisons);
  }

  getBenchmarkHistory(): ModelBenchmark[] {
    return benchmarkRunner.getBenchmarks();
  }

  clearHistory(): void {
    benchmarkRunner.clearBenchmarks();
  }
}

export const benchmarkManager = new BenchmarkManager();
