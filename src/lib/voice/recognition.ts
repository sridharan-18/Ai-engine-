/**
 * Speech Recognition
 * Handles voice input using Web Speech API
 */

import { SpeechRecognitionResult, VoiceConfig } from './types';

export class SpeechRecognition {
  private recognition: any = null;
  private isListening: boolean = false;
  private config: VoiceConfig;

  constructor(config?: Partial<VoiceConfig>) {
    this.config = {
      language: config?.language || 'en-US',
      rate: config?.rate || 1,
      pitch: config?.pitch || 1,
      volume: config?.volume || 1,
    };

    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.config.language;
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  async startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (!this.isSupported()) {
      onError?.('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const confidence = event.results[last][0].confidence;
      const isFinal = event.results[last].isFinal;

      onResult({
        transcript,
        confidence,
        isFinal,
      });
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  updateConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.recognition) {
      this.recognition.lang = this.config.language;
    }
  }
}
