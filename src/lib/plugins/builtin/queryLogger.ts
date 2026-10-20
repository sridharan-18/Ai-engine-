/**
 * Built-in Plugin: Query Logger
 * Logs all queries and responses for analytics
 */

import { Plugin, PluginContext } from '../types';

export const queryLoggerPlugin: Plugin = {
  manifest: {
    id: 'query-logger',
    name: 'Query Logger',
    version: '1.0.0',
    description: 'Logs all queries and responses for analytics',
    author: 'Vane',
    permissions: ['database'],
    hooks: ['after-query', 'after-response'],
    settings: [
      {
        key: 'logToDatabase',
        type: 'boolean',
        label: 'Log to Database',
        description: 'Store logs in the database',
        default: true,
      },
      {
        key: 'logToConsole',
        type: 'boolean',
        label: 'Log to Console',
        description: 'Print logs to console',
        default: false,
      },
    ],
  },
  enabled: true,
  settings: {
    logToDatabase: true,
    logToConsole: false,
  },
  
  async initialize(context: PluginContext) {
    console.log('Query Logger plugin initialized');
  },

  async execute(hook, context) {
    if (hook === 'after-query' && context.query) {
      const log = {
        query: context.query,
        timestamp: new Date().toISOString(),
      };

      if (this.settings.logToConsole) {
        console.log('Query:', log);
      }

      if (this.settings.logToDatabase) {
        // TODO: Implement database logging
      }

      return log;
    }

    if (hook === 'after-response' && context.response) {
      const log = {
        responseLength: JSON.stringify(context.response).length,
        timestamp: new Date().toISOString(),
      };

      if (this.settings.logToConsole) {
        console.log('Response:', log);
      }

      return log;
    }

    return null;
  },

  async cleanup() {
    console.log('Query Logger plugin cleaned up');
  },
};
