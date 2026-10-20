/**
 * Fine-tuning Manager
 * Unified interface for fine-tuning local models
 */

import { ollamaFineTuner, FineTuningConfig, FineTuningProgress } from './ollama';
import { llamaFineTuner, LLaMAFineTuningConfig } from './llama';

export type ModelProvider = 'ollama' | 'llama';

export interface FineTuningJob {
  id: string;
  provider: ModelProvider;
  config: FineTuningConfig | LLaMAFineTuningConfig;
  status: FineTuningProgress['status'];
  progress: number;
  startTime: string;
  endTime?: string;
  outputModel?: string;
}

export class FineTuningManager {
  private jobs: Map<string, FineTuningJob> = new Map();
  private activeJobId: string | null = null;

  async startOllamaFineTuning(config: FineTuningConfig): Promise<string> {
    const jobId = crypto.randomUUID();
    
    const job: FineTuningJob = {
      id: jobId,
      provider: 'ollama',
      config,
      status: 'idle',
      progress: 0,
      startTime: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);
    this.activeJobId = jobId;

    ollamaFineTuner.setProgressCallback((progress) => {
      job.status = progress.status;
      job.progress = progress.progress;
      
      if (progress.status === 'completed') {
        job.endTime = new Date().toISOString();
        job.outputModel = config.outputModel || `${config.baseModel}-finetuned`;
      }
    });

    try {
      await ollamaFineTuner.startFineTuning(config);
    } catch (error) {
      job.status = 'error';
      job.endTime = new Date().toISOString();
    }

    return jobId;
  }

  async startLLaMAFineTuning(config: LLaMAFineTuningConfig): Promise<string> {
    const jobId = crypto.randomUUID();
    
    const job: FineTuningJob = {
      id: jobId,
      provider: 'llama',
      config,
      status: 'preparing',
      progress: 0,
      startTime: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);
    this.activeJobId = jobId;

    try {
      const script = await llamaFineTuner.generateTrainingScript(config);
      job.status = 'completed';
      job.progress = 100;
      job.endTime = new Date().toISOString();
      job.outputModel = config.outputDir;
    } catch (error) {
      job.status = 'error';
      job.endTime = new Date().toISOString();
    }

    return jobId;
  }

  getJob(jobId: string): FineTuningJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): FineTuningJob[] {
    return Array.from(this.jobs.values());
  }

  getActiveJob(): FineTuningJob | undefined {
    if (!this.activeJobId) return undefined;
    return this.jobs.get(this.activeJobId);
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'training' || job.status === 'preparing') {
      job.status = 'error';
      job.endTime = new Date().toISOString();
      return true;
    }

    return false;
  }

  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  async getAvailableOllamaModels(): Promise<string[]> {
    return ollamaFineTuner.getAvailableModels();
  }

  async estimateLLaMATrainingTime(config: LLaMAFineTuningConfig): Promise<number> {
    return llamaFineTuner.estimateTrainingTime(config);
  }

  async estimateLLaMAVRAM(config: LLaMAFineTuningConfig): Promise<number> {
    return llamaFineTuner.estimateVRAM(config);
  }
}

export const fineTuningManager = new FineTuningManager();
