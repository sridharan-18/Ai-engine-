# AI Model Flexibility Features

This document describes the new features for AI model fine-tuning and performance benchmarking.

## 1. Fine-tuning Hooks for Local Models

### Overview
Provides scripts and utilities for users to fine-tune local models (Ollama, LLaMA) with their own datasets. This enables customization of models for specific use cases and domains.

### Supported Frameworks

#### Ollama Fine-tuning
- **Base Models**: Any Ollama-hosted model (llama2, mistral, codellama, etc.)
- **Features**:
  - Dataset preparation and validation
  - Training script generation
  - Progress tracking with callbacks
  - Model validation after training
- **Usage**:
  ```typescript
  import { ollamaFineTuner } from '@/lib/finetuning';
  
  ollamaFineTuner.setProgressCallback((progress) => {
    console.log(`Progress: ${progress.progress}% - ${progress.message}`);
  });
  
  await ollamaFineTuner.startFineTuning({
    modelName: 'my-custom-model',
    baseModel: 'llama2',
    datasetPath: '/path/to/dataset.json',
    epochs: 3,
    learningRate: 0.0001,
    outputModel: 'llama2-finetuned',
  });
  ```

#### LLaMA Fine-tuning
Supports multiple fine-tuning frameworks:

**llama.cpp**
- Lightweight C++ implementation
- Good for resource-constrained environments
- Supports quantization for lower memory usage

**PEFT (Parameter-Efficient Fine-Tuning)**
- Uses LoRA (Low-Rank Adaptation)
- Minimal memory requirements
- Fast training with good results

**Axolotl**
- Configuration-based fine-tuning
- Supports multiple model architectures
- Easy to use for beginners

**Unsloth**
- Optimized for speed
- 2x faster than standard implementations
- Best for rapid experimentation

- **Usage**:
  ```typescript
  import { llamaFineTuner } from '@/lib/finetuning';
  
  const script = await llamaFineTuner.generateTrainingScript({
    modelSize: '7b',
    framework: 'unsloth',
    datasetPath: '/path/to/dataset.json',
    outputDir: './output',
    epochs: 3,
    learningRate: 0.0001,
    batchSize: 4,
    loraR: 8,
    loraAlpha: 32,
    quantization: '4bit',
  });
  
  // Save and run the script
  ```

### Dataset Format
The expected dataset format is JSON with the following structure:

```json
[
  {
    "instruction": "What is the capital of France?",
    "input": "",
    "output": "The capital of France is Paris."
  },
  {
    "instruction": "Explain photosynthesis.",
    "input": "",
    "output": "Photosynthesis is the process by which plants convert sunlight into energy..."
  }
]
```

### Fine-tuning Manager
The `FineTuningManager` class provides a unified interface for managing fine-tuning jobs:

- Start and track multiple fine-tuning jobs
- Monitor progress with real-time updates
- Cancel running jobs
- View job history
- Estimate training time and VRAM requirements

### API Endpoints

#### GET /api/finetuning
- `action=jobs`: Get all fine-tuning jobs
- `action=active`: Get currently active job
- `action=ollama-models`: Get available Ollama models
- `action=estimate`: Estimate training time and VRAM for LLaMA

#### POST /api/finetuning
- `action=start-ollama`: Start Ollama fine-tuning job
- `action=start-llama`: Generate LLaMA training script

#### DELETE /api/finetuning
- `action=cancel&id={jobId}`: Cancel running job
- `action=delete&id={jobId}`: Delete job from history

### UI Component
The `FineTuningManager` component provides:
- Form to configure fine-tuning jobs
- Selection between Ollama and LLaMA providers
- Framework selection for LLaMA
- Job list with progress tracking
- Cancel and delete functionality

### Configuration
Set the following environment variable:
- `OLLAMA_BASE_URL`: Your Ollama instance URL (default: http://localhost:11434)

## 2. Model Benchmark Dashboard

### Overview
Compare latency, accuracy, and cost across different AI model providers (OpenAI, Claude, Gemini, Groq, Ollama) to make informed decisions about which model to use.

### Supported Providers

#### Cloud Providers
- **OpenAI**: GPT-4, GPT-3.5 Turbo
- **Claude**: Claude 3 Opus, Sonnet, Haiku
- **Gemini**: Gemini Pro, Gemini 1.5 Pro
- **Groq**: LLaMA2 70B, Mixtral 8x7B, Gemma 7B

#### Local Providers
- **Ollama**: LLaMA2, Mistral, CodeLLaMA
- **Local**: Custom local models

### Metrics Tracked

- **Latency**: Average response time in milliseconds
- **Throughput**: Requests per second
- **Cost**: Cost per 1,000 tokens in USD
- **Accuracy**: Optional accuracy score (if applicable)
- **Memory Usage**: Memory usage for local models (MB)
- **VRAM Usage**: VRAM usage for local models (MB)

### Benchmark Runner
The `BenchmarkRunner` class executes performance tests:

```typescript
import { benchmarkRunner } from '@/lib/benchmark';

// Run single benchmark
const benchmark = await benchmarkRunner.runBenchmark(
  'openai',
  'gpt-4',
  'What is the capital of France?',
  5 // iterations
);

// Run full benchmark across multiple providers
const config = {
  providers: ['openai', 'claude', 'gemini', 'groq'],
  testPrompts: [
    'What is the capital of France?',
    'Explain quantum computing.',
    'Write a short poem.',
  ],
  iterations: 3,
};

const benchmarks = await benchmarkRunner.runFullBenchmark(config);
```

### Benchmark Analyzer
The `BenchmarkAnalyzer` class analyzes results:

- Compares performance across models
- Calculates rankings for each metric
- Provides overall performance ranking
- Generates recommendations
- Tracks performance trends over time

### API Endpoints

#### GET /api/benchmark
- `action=history`: Get benchmark history
- `action=quick`: Run quick benchmark across default providers

#### POST /api/benchmark
- `action=single`: Run benchmark for single provider/model
- `action=custom`: Run custom benchmark with custom configuration
- `action=recommendations`: Get model recommendations based on benchmarks

#### DELETE /api/benchmark
- Clear all benchmark history

### UI Component
The `BenchmarkDashboard` component provides:
- Quick benchmark button for instant comparison
- Performance comparison table
- Color-coded rankings
- Recommendations based on results
- History management (clear history)
- Real-time progress updates

### Benchmark Configuration
Quick benchmark uses default configuration:
- Providers: OpenAI, Claude, Gemini, Groq
- Test prompts: 3 diverse questions
- Iterations: 3 per prompt

Custom benchmark allows:
- Select specific providers
- Custom test prompts
- Adjust iteration count
- Include local models

### Recommendations System
The analyzer provides intelligent recommendations:
- Fastest model for latency-sensitive applications
- Highest throughput for high-volume applications
- Lowest cost for budget-conscious users
- Overall best performer

## Usage Examples

### Fine-tuning a Model
```
1. Prepare your dataset in JSON format
2. Navigate to Settings → Model Fine-tuning
3. Select provider (Ollama or LLaMA)
4. Configure parameters (model, epochs, learning rate)
5. Start fine-tuning
6. Monitor progress in real-time
7. Use the fine-tuned model in your applications
```

### Running Benchmarks
```
1. Navigate to Settings → Model Benchmark Dashboard
2. Click "Run Quick Benchmark" for instant comparison
3. View results in the comparison table
4. Read recommendations for your use case
5. Clear history when needed
```

## Performance Considerations

### Fine-tuning
- **Training Time**: Varies by model size and framework
  - 7B model: ~2 hours with Unsloth
  - 13B model: ~4 hours with Unsloth
  - 70B model: ~20 hours with Unsloth
- **VRAM Requirements**:
  - 7B with 4-bit: ~8GB
  - 13B with 4-bit: ~12GB
  - 70B with 4-bit: ~40GB
- **Dataset Size**: 100-1000 examples recommended for good results

### Benchmarking
- **Execution Time**: Quick benchmark takes ~1-2 minutes
- **API Costs**: Actual API calls are simulated in current implementation
- **Accuracy**: In production, implement actual accuracy testing
- **Rate Limits**: Respect API rate limits when running real benchmarks

## Security Considerations

- Store API keys in environment variables
- Validate dataset inputs before fine-tuning
- Implement rate limiting for benchmark API calls
- Use HTTPS for all external API communications
- Sanitize user inputs in benchmark prompts

## Future Enhancements

### Fine-tuning
- Add support for more frameworks (QLoRA, AdaLoRA)
- Implement distributed training
- Add model sharing between users
- Provide fine-tuning templates for common use cases
- Add automatic hyperparameter tuning

### Benchmarking
- Implement real API calls for accurate benchmarks
- Add more providers (Cohere, AI21, Mistral API)
- Implement accuracy testing with evaluation datasets
- Add historical performance tracking
- Provide cost optimization suggestions
- Add A/B testing framework

## Troubleshooting

### Fine-tuning Issues
- **Issue**: Training script generation fails
  - **Solution**: Check dataset format and path
- **Issue**: Out of memory during training
  - **Solution**: Use quantization or smaller batch size
- **Issue**: Poor model performance after fine-tuning
  - **Solution**: Increase dataset size or adjust learning rate

### Benchmarking Issues
- **Issue**: Benchmark results inconsistent
  - **Solution**: Increase iteration count for more stable results
- **Issue**: API rate limit errors
  - **Solution**: Add delays between API calls
- **Issue**: Recommendations don't match needs
  - **Solution**: Run custom benchmark with your specific prompts

## Conclusion

These features significantly enhance Vane's AI model flexibility by:
- Enabling custom model training for specific use cases
- Providing data-driven model selection through benchmarking
- Supporting both local and cloud model ecosystems
- Offering multiple fine-tuning frameworks for different needs

All implementations follow the existing codebase patterns and are designed to be easily extended with additional providers and frameworks.
