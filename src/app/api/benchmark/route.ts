import { NextRequest, NextResponse } from 'next/server';
import { benchmarkManager } from '@/lib/benchmark';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'history') {
      const history = benchmarkManager.getBenchmarkHistory();
      return NextResponse.json(history);
    }

    if (action === 'quick') {
      const comparisons = await benchmarkManager.runQuickBenchmark();
      return NextResponse.json(comparisons);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in benchmark API:', error);
    return NextResponse.json({ error: 'Failed to process benchmark request' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, provider, modelName, testPrompt, config } = body;

    if (action === 'single') {
      const benchmark = await benchmarkManager.runSingleProviderBenchmark(
        provider,
        modelName,
        testPrompt
      );
      return NextResponse.json(benchmark);
    }

    if (action === 'custom') {
      const comparisons = await benchmarkManager.runCustomBenchmark(config);
      return NextResponse.json(comparisons);
    }

    if (action === 'recommendations') {
      const recommendations = benchmarkManager.getRecommendations(body.comparisons);
      return NextResponse.json({ recommendations });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in benchmark API:', error);
    return NextResponse.json({ error: 'Failed to process benchmark request' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    benchmarkManager.clearHistory();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing benchmark history:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
