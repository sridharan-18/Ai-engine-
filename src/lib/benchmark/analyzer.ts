/**
 * Model Benchmark Analyzer
 * Analyzes benchmark results and provides comparisons
 */

import { ModelBenchmark, BenchmarkComparison, BenchmarkHistory, BenchmarkMetrics } from './types';

export class BenchmarkAnalyzer {
  compareBenchmarks(benchmarks: ModelBenchmark[]): BenchmarkComparison[] {
    const comparisons: BenchmarkComparison[] = [];

    // Group by model
    const modelGroups = new Map<string, ModelBenchmark[]>();
    benchmarks.forEach(b => {
      const key = `${b.provider}-${b.modelName}`;
      if (!modelGroups.has(key)) {
        modelGroups.set(key, []);
      }
      modelGroups.get(key)!.push(b);
    });

    // Calculate averages for each model
    const averagedMetrics = new Map<string, BenchmarkMetrics>();
    modelGroups.forEach((benchmarks, key) => {
      const avg = this.averageMetrics(benchmarks.map(b => b.metrics));
      averagedMetrics.set(key, avg);
    });

    // Calculate rankings
    const latencyRank = this.rankByMetric(averagedMetrics, 'latency', 'asc');
    const throughputRank = this.rankByMetric(averagedMetrics, 'throughput', 'desc');
    const costRank = this.rankByMetric(averagedMetrics, 'costPer1kTokens', 'asc');

    // Build comparisons
    modelGroups.forEach((benchmarks, key) => {
      const [provider, modelName] = key.split('-');
      const metrics = averagedMetrics.get(key)!;

      comparisons.push({
        provider: provider as any,
        modelName,
        metrics,
        rank: {
          latency: latencyRank.get(key)!,
          throughput: throughputRank.get(key)!,
          cost: costRank.get(key)!,
          overall: this.calculateOverallRank(
            latencyRank.get(key)!,
            throughputRank.get(key)!,
            costRank.get(key)!
          ),
        },
      });
    });

    // Sort by overall rank
    comparisons.sort((a, b) => a.rank.overall - b.rank.overall);

    return comparisons;
  }

  private averageMetrics(metricsArray: BenchmarkMetrics[]): BenchmarkMetrics {
    const count = metricsArray.length;
    
    return {
      latency: metricsArray.reduce((sum, m) => sum + m.latency, 0) / count,
      throughput: metricsArray.reduce((sum, m) => sum + m.throughput, 0) / count,
      accuracy: metricsArray[0].accuracy,
      costPer1kTokens: metricsArray.reduce((sum, m) => sum + m.costPer1kTokens, 0) / count,
      memoryUsage: metricsArray[0].memoryUsage,
      vramUsage: metricsArray[0].vramUsage,
    };
  }

  private rankByMetric(
    metrics: Map<string, BenchmarkMetrics>,
    metric: keyof BenchmarkMetrics,
    order: 'asc' | 'desc'
  ): Map<string, number> {
    const sorted = Array.from(metrics.entries()).sort((a, b) => {
      const aVal = a[1][metric] as number;
      const bVal = b[1][metric] as number;
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const ranks = new Map<string, number>();
    sorted.forEach(([key], index) => {
      ranks.set(key, index + 1);
    });

    return ranks;
  }

  private calculateOverallRank(latency: number, throughput: number, cost: number): number {
    // Weighted average: latency (40%), throughput (30%), cost (30%)
    return (latency * 0.4) + (throughput * 0.3) + (cost * 0.3);
  }

  analyzeHistory(benchmarks: ModelBenchmark[], modelId: string): BenchmarkHistory {
    const modelBenchmarks = benchmarks.filter(b => b.id === modelId);
    
    if (modelBenchmarks.length === 0) {
      throw new Error('No benchmarks found for model');
    }

    const sorted = [...modelBenchmarks].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const averageMetrics = this.averageMetrics(sorted.map(b => b.metrics));
    
    // Determine trend
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = this.averageMetrics(firstHalf.map(b => b.metrics));
    const secondAvg = this.averageMetrics(secondHalf.map(b => b.metrics));

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (secondAvg.latency < firstAvg.latency * 0.95) {
      trend = 'improving';
    } else if (secondAvg.latency > firstAvg.latency * 1.05) {
      trend = 'declining';
    }

    return {
      modelId,
      benchmarks: sorted,
      averageMetrics,
      trend,
    };
  }

  getRecommendations(comparisons: BenchmarkComparison[]): string[] {
    const recommendations: string[] = [];

    if (comparisons.length === 0) {
      return ['No benchmark data available for recommendations'];
    }

    const bestLatency = comparisons.find(c => c.rank.latency === 1);
    const bestThroughput = comparisons.find(c => c.rank.throughput === 1);
    const bestCost = comparisons.find(c => c.rank.cost === 1);
    const bestOverall = comparisons[0];

    if (bestLatency) {
      recommendations.push(
        `For fastest response times, use ${bestLatency.provider}/${bestLatency.modelName} (${bestLatency.metrics.latency.toFixed(0)}ms)`
      );
    }

    if (bestThroughput) {
      recommendations.push(
        `For highest throughput, use ${bestThroughput.provider}/${bestThroughput.modelName} (${bestThroughput.metrics.throughput.toFixed(2)} req/s)`
      );
    }

    if (bestCost && bestCost.metrics.costPer1kTokens === 0) {
      recommendations.push(
        `For cost efficiency, use ${bestCost.provider}/${bestCost.modelName} (free)`
      );
    } else if (bestCost) {
      recommendations.push(
        `For lowest cost, use ${bestCost.provider}/${bestCost.modelName} ($${bestCost.metrics.costPer1kTokens}/1k tokens)`
      );
    }

    recommendations.push(
      `Overall best performer: ${bestOverall.provider}/${bestOverall.modelName}`
    );

    return recommendations;
  }
}

export const benchmarkAnalyzer = new BenchmarkAnalyzer();
