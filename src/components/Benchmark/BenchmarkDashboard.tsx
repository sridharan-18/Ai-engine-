'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, DollarSign, Zap, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BenchmarkComparison {
  provider: string;
  modelName: string;
  metrics: {
    latency: number;
    throughput: number;
    costPer1kTokens: number;
  };
  rank: {
    latency: number;
    throughput: number;
    cost: number;
    overall: number;
  };
}

const BenchmarkDashboard = () => {
  const [comparisons, setComparisons] = useState<BenchmarkComparison[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/benchmark?action=history');
      const data = await response.json();
      if (data.length > 0) {
        setComparisons(data);
        const recResponse = await fetch('/api/benchmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'recommendations', comparisons: data }),
        });
        const recData = await recResponse.json();
        setRecommendations(recData.recommendations);
      }
    } catch (error) {
      console.error('Error fetching benchmark history:', error);
    }
  };

  const runQuickBenchmark = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/benchmark?action=quick');
      const data = await response.json();
      setComparisons(data);
      
      const recResponse = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recommendations', comparisons: data }),
      });
      const recData = await recResponse.json();
      setRecommendations(recData.recommendations);
      
      toast.success('Benchmark completed successfully');
    } catch (error) {
      console.error('Error running benchmark:', error);
      toast.error('Failed to run benchmark');
    } finally {
      setIsRunning(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all benchmark history?')) return;

    try {
      await fetch('/api/benchmark', { method: 'DELETE' });
      setComparisons([]);
      setRecommendations([]);
      toast.success('Benchmark history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    }
  };

  const getLatencyColor = (rank: number) => {
    if (rank === 1) return 'text-green-600';
    if (rank <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLatency = (ms: number) => `${ms.toFixed(0)}ms`;
  const formatThroughput = (rps: number) => `${rps.toFixed(2)} req/s`;
  const formatCost = (cost: number) => cost === 0 ? 'Free' : `$${cost.toFixed(4)}/1k`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Model Benchmark Dashboard</h2>
        <div className="flex gap-3">
          <button
            onClick={runQuickBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Play size={18} />
            {isRunning ? 'Running...' : 'Run Quick Benchmark'}
          </button>
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 border border-light-200 dark:border-dark-200 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors text-black dark:text-white"
          >
            <Trash2 size={18} />
            Clear History
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <TrendingUp size={18} />
            Recommendations
          </h3>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            {recommendations.map((rec, i) => (
              <li key={i}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {comparisons.length === 0 ? (
        <div className="text-center py-12 text-black/50 dark:text-white/50">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No benchmark data yet. Run a benchmark to see comparisons.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-5 border border-light-200 dark:border-dark-200">
            <h3 className="font-semibold mb-4 text-black dark:text-white flex items-center gap-2">
              <BarChart3 size={20} />
              Performance Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-light-200 dark:border-dark-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-black dark:text-white">Model</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-black dark:text-white flex items-center gap-1">
                      <Clock size={14} /> Latency
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-black dark:text-white flex items-center gap-1">
                      <Zap size={14} /> Throughput
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-black dark:text-white flex items-center gap-1">
                      <DollarSign size={14} /> Cost
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-black dark:text-white">Overall Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comp, index) => (
                    <tr key={index} className="border-b border-light-100 dark:border-dark-100">
                      <td className="py-3 px-4">
                        <div className="font-medium text-black dark:text-white">
                          {comp.provider}/{comp.modelName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={getLatencyColor(comp.rank.latency)}>
                          {formatLatency(comp.metrics.latency)}
                          <span className="text-xs ml-1">#{comp.rank.latency}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-black dark:text-white">
                        {formatThroughput(comp.metrics.throughput)}
                        <span className="text-xs ml-1 text-black/60 dark:text-white/60">#{comp.rank.throughput}</span>
                      </td>
                      <td className="py-3 px-4 text-black dark:text-white">
                        {formatCost(comp.metrics.costPer1kTokens)}
                        <span className="text-xs ml-1 text-black/60 dark:text-white/60">#{comp.rank.cost}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          index === 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          index === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          index === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                        }`}>
                          #{comp.rank.overall.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchmarkDashboard;
