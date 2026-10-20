'use client';

import { useState, useEffect } from 'react';
import { Cpu, Play, StopCircle, Trash2, Download, Clock, MemoryStick } from 'lucide-react';
import { toast } from 'sonner';

interface FineTuningJob {
  id: string;
  provider: string;
  config: any;
  status: string;
  progress: number;
  startTime: string;
  endTime?: string;
  outputModel?: string;
}

const FineTuningManager = () => {
  const [jobs, setJobs] = useState<FineTuningJob[]>([]);
  const [activeJob, setActiveJob] = useState<FineTuningJob | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'ollama' | 'llama'>('ollama');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchOllamaModels();
    
    // Poll for active job updates
    const interval = setInterval(() => {
      if (activeJob && activeJob.status !== 'completed' && activeJob.status !== 'error') {
        fetchJobs();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/finetuning?action=jobs');
      const data = await response.json();
      setJobs(data);
      
      const activeResponse = await fetch('/api/finetuning?action=active');
      const activeData = await activeResponse.json();
      setActiveJob(activeData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchOllamaModels = async () => {
    try {
      const response = await fetch('/api/finetuning?action=ollama-models');
      const data = await response.json();
      setOllamaModels(data.models || []);
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
    }
  };

  const startOllamaFineTuning = async (config: any) => {
    try {
      const response = await fetch('/api/finetuning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start-ollama', provider: 'ollama', config }),
      });
      const data = await response.json();
      toast.success('Fine-tuning job started');
      setShowForm(false);
      fetchJobs();
    } catch (error) {
      console.error('Error starting fine-tuning:', error);
      toast.error('Failed to start fine-tuning');
    }
  };

  const startLLaMAFineTuning = async (config: any) => {
    try {
      const response = await fetch('/api/finetuning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start-llama', provider: 'llama', config }),
      });
      const data = await response.json();
      toast.success('Training script generated');
      setShowForm(false);
      fetchJobs();
    } catch (error) {
      console.error('Error generating script:', error);
      toast.error('Failed to generate training script');
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/finetuning?action=cancel&id=${jobId}`, { method: 'DELETE' });
      toast.success('Job cancelled');
      fetchJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast.error('Failed to cancel job');
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      await fetch(`/api/finetuning?action=delete&id=${jobId}`, { method: 'DELETE' });
      toast.success('Job deleted');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'training': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Model Fine-tuning</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Cpu size={18} />
          {showForm ? 'Cancel' : 'New Fine-tuning Job'}
        </button>
      </div>

      {showForm && (
        <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-6 mb-6 border border-light-200 dark:border-dark-200">
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Configure Fine-tuning</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black dark:text-white">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
            >
              <option value="ollama">Ollama</option>
              <option value="llama">LLaMA</option>
            </select>
          </div>

          {selectedProvider === 'ollama' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Base Model</label>
                <select className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white">
                  {ollamaModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Dataset Path</label>
                <input
                  type="text"
                  placeholder="/path/to/dataset.json"
                  className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Output Model Name</label>
                <input
                  type="text"
                  placeholder="my-finetuned-model"
                  className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                />
              </div>
              <button
                onClick={() => startOllamaFineTuning({})}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Fine-tuning
              </button>
            </>
          )}

          {selectedProvider === 'llama' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Model Size</label>
                <select className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white">
                  <option value="7b">7B</option>
                  <option value="13b">13B</option>
                  <option value="34b">34B</option>
                  <option value="70b">70B</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Framework</label>
                <select className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white">
                  <option value="llama-cpp">llama.cpp</option>
                  <option value="peft">PEFT (LoRA)</option>
                  <option value="axolotl">Axolotl</option>
                  <option value="unsloth">Unsloth (Fastest)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Dataset Path</label>
                <input
                  type="text"
                  placeholder="/path/to/dataset.json"
                  className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Output Directory</label>
                <input
                  type="text"
                  placeholder="/path/to/output"
                  className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                />
              </div>
              <button
                onClick={() => startLLaMAFineTuning({})}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Generate Training Script
              </button>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-5 border border-light-200 dark:border-dark-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-black dark:text-white">
                  {job.provider} Fine-tuning
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Started: {new Date(job.startTime).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {job.status === 'training' && (
                  <button
                    onClick={() => cancelJob(job.id)}
                    className="p-1.5 hover:bg-light-primary dark:hover:bg-dark-primary rounded transition-colors"
                  >
                    <StopCircle size={16} className="text-red-600" />
                  </button>
                )}
                <button
                  onClick={() => deleteJob(job.id)}
                  className="p-1.5 hover:bg-light-primary dark:hover:bg-dark-primary rounded transition-colors"
                >
                  <Trash2 size={16} className="text-black/60 dark:text-white/60" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </div>
              {job.progress > 0 && (
                <div className="flex-1 bg-light-primary dark:bg-dark-primary rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
            </div>

            {job.outputModel && (
              <div className="text-sm text-black/60 dark:text-white/60">
                Output: {job.outputModel}
              </div>
            )}
          </div>
        ))}

        {jobs.length === 0 && !showForm && (
          <div className="text-center py-12 text-black/50 dark:text-white/50">
            <Cpu size={48} className="mx-auto mb-4 opacity-50" />
            <p>No fine-tuning jobs yet. Create your first job to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FineTuningManager;
