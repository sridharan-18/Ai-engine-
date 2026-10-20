import { NextRequest, NextResponse } from 'next/server';
import { fineTuningManager } from '@/lib/finetuning';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'jobs') {
      const jobs = fineTuningManager.getAllJobs();
      return NextResponse.json(jobs);
    }

    if (action === 'active') {
      const activeJob = fineTuningManager.getActiveJob();
      return NextResponse.json(activeJob);
    }

    if (action === 'ollama-models') {
      const models = await fineTuningManager.getAvailableOllamaModels();
      return NextResponse.json({ models });
    }

    if (action === 'estimate') {
      const provider = searchParams.get('provider');
      const config = JSON.parse(searchParams.get('config') || '{}');

      if (provider === 'llama') {
        const time = await fineTuningManager.estimateLLaMATrainingTime(config);
        const vram = await fineTuningManager.estimateLLaMAVRAM(config);
        return NextResponse.json({ time, vram });
      }

      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in fine-tuning API:', error);
    return NextResponse.json({ error: 'Failed to process fine-tuning request' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, provider, config } = body;

    if (action === 'start-ollama') {
      const jobId = await fineTuningManager.startOllamaFineTuning(config);
      return NextResponse.json({ jobId });
    }

    if (action === 'start-llama') {
      const jobId = await fineTuningManager.startLLaMAFineTuning(config);
      return NextResponse.json({ jobId });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in fine-tuning API:', error);
    return NextResponse.json({ error: 'Failed to process fine-tuning request' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const jobId = searchParams.get('id');

    if (action === 'cancel' && jobId) {
      const success = fineTuningManager.cancelJob(jobId);
      return NextResponse.json({ success });
    }

    if (action === 'delete' && jobId) {
      const success = fineTuningManager.deleteJob(jobId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action or missing job ID' }, { status: 400 });
  } catch (error) {
    console.error('Error in fine-tuning API:', error);
    return NextResponse.json({ error: 'Failed to process fine-tuning request' }, { status: 500 });
  }
}
