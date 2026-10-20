/**
 * Analytics Collector
 * Collects and stores analytics events
 */

import { AnalyticsEvent } from './types';

export class AnalyticsCollector {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = crypto.randomUUID();
  }

  async trackEvent(
    eventType: AnalyticsEvent['eventType'],
    data: Record<string, any>,
    userId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      eventType,
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.sessionId,
      data,
    };

    this.events.push(event);

    // In production, send to analytics service
    // await this.sendToAnalyticsService(event);
  }

  async trackQuery(query: string, userId?: string): Promise<void> {
    await this.trackEvent('query', { query }, userId);
  }

  async trackResponse(
    response: any,
    responseTime: number,
    model: string,
    provider: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('response', {
      responseLength: JSON.stringify(response).length,
      responseTime,
      model,
      provider,
    }, userId);
  }

  async trackError(error: Error, context: Record<string, any>, userId?: string): Promise<void> {
    await this.trackEvent('error', {
      error: error.message,
      stack: error.stack,
      context,
    }, userId);
  }

  async trackPluginExecution(
    pluginId: string,
    hook: string,
    executionTime: number,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('plugin_execution', {
      pluginId,
      hook,
      executionTime,
    }, userId);
  }

  async trackFileUpload(
    fileName: string,
    fileSize: number,
    fileType: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('file_upload', {
      fileName,
      fileSize,
      fileType,
    }, userId);
  }

  getEvents(timeRange?: { start: string; end: string }): AnalyticsEvent[] {
    if (!timeRange) {
      return this.events;
    }

    const start = new Date(timeRange.start).getTime();
    const end = new Date(timeRange.end).getTime();

    return this.events.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime >= start && eventTime <= end;
    });
  }

  clearEvents(): void {
    this.events = [];
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const analyticsCollector = new AnalyticsCollector();
