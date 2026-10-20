/**
 * Voice Input/Output Types
 */

export interface VoiceConfig {
  language: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceSynthesisOptions {
  text: string;
  voice?: string;
  language?: string;
  rate?: number;
  pitch?: number;
}
