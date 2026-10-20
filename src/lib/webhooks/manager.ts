/**
 * Webhook Manager
 * Manages webhook registration and delivery
 */

import { Webhook, WebhookEvent, WebhookDeliveryResult } from './types';

export class WebhookManager {
  private webhooks: Map<string, Webhook> = new Map();
  private eventQueue: WebhookEvent[] = [];

  async registerWebhook(webhook: Omit<Webhook, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const newWebhook: Webhook = {
      ...webhook,
      id,
      createdAt: new Date().toISOString(),
    };

    this.webhooks.set(id, newWebhook);
    return id;
  }

  async unregisterWebhook(webhookId: string): Promise<boolean> {
    return this.webhooks.delete(webhookId);
  }

  async triggerEvent(eventType: string, payload: any): Promise<WebhookDeliveryResult[]> {
    const results: WebhookDeliveryResult[] = [];

    // Find webhooks that subscribe to this event
    const matchingWebhooks = Array.from(this.webhooks.values()).filter(
      w => w.enabled && w.events.includes(eventType)
    );

    // Deliver to each webhook
    for (const webhook of matchingWebhooks) {
      const result = await this.deliverWebhook(webhook, eventType, payload);
      results.push(result);
    }

    return results;
  }

  private async deliverWebhook(
    webhook: Webhook,
    eventType: string,
    payload: any
  ): Promise<WebhookDeliveryResult> {
    const event: WebhookEvent = {
      id: crypto.randomUUID(),
      eventType,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': eventType,
          'X-Webhook-ID': event.id,
          ...(webhook.secret && { 'X-Webhook-Signature': this.generateSignature(event, webhook.secret) }),
        },
        body: JSON.stringify(payload),
      });

      return {
        webhookId: webhook.id,
        success: response.ok,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        webhookId: webhook.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private generateSignature(event: WebhookEvent, secret: string): string {
    // In production, use HMAC-SHA256
    const data = event.id + event.timestamp + JSON.stringify(event.payload);
    return Buffer.from(data + secret).toString('base64');
  }

  getWebhook(webhookId: string): Webhook | undefined {
    return this.webhooks.get(webhookId);
  }

  getAllWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  async enableWebhook(webhookId: string): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (webhook) {
      webhook.enabled = true;
      return true;
    }
    return false;
  }

  async disableWebhook(webhookId: string): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (webhook) {
      webhook.enabled = false;
      return true;
    }
    return false;
  }
}

export const webhookManager = new WebhookManager();
