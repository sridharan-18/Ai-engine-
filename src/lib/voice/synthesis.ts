/**
 * Speech Synthesis
 * Handles voice output using Web Speech API
 */

import { VoiceSynthesisOptions, VoiceConfig } from './types';

export class SpeechSynthesis {
  private synthesis: any = null;
  private voices: any[] = [];
  private config: VoiceConfig;

  constructor(config?: Partial<VoiceConfig>) {
    this.config = {
      language: config?.language || 'en-US',
      rate: config?.rate || 1,
      pitch: config?.pitch || 1,
      volume: config?.volume || 1,
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      // Load voices
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => {
          this.voices = this.synthesis.getVoices();
        };
      } else {
        this.voices = this.synthesis.getVoices();
      }
    }
  }

  isSupported(): boolean {
    return this.synthesis !== null;
  }

  getVoices(): any[] {
    return this.voices;
  }

  async speak(options: VoiceSynthesisOptions): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(options.text);
      
      utterance.lang = options.language || this.config.language;
      utterance.rate = options.rate || this.config.rate;
      utterance.pitch = options.pitch || this.config.pitch;
      utterance.volume = this.config.volume;

      if (options.voice) {
        const voice = this.voices.find(v => v.name === options.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error: any) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  updateConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
