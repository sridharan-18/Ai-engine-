/**
 * Built-in Plugin: Content Filter
 * Filters inappropriate content from queries and responses
 */

import { Plugin, PluginContext } from '../types';

export const contentFilterPlugin: Plugin = {
  manifest: {
    id: 'content-filter',
    name: 'Content Filter',
    version: '1.0.0',
    description: 'Filters inappropriate content from queries and responses',
    author: 'Vane',
    permissions: [],
    hooks: ['before-query', 'before-response'],
    settings: [
      {
        key: 'filterLevel',
        type: 'select',
        label: 'Filter Level',
        description: 'Strictness of content filtering',
        default: 'medium',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
      {
        key: 'blockProfanity',
        type: 'boolean',
        label: 'Block Profanity',
        description: 'Block profane language',
        default: true,
      },
    ],
  },
  enabled: true,
  settings: {
    filterLevel: 'medium',
    blockProfanity: true,
  },

  async initialize(context: PluginContext) {
    console.log('Content Filter plugin initialized');
  },

  async execute(hook, context) {
    const profanityList = ['badword1', 'badword2']; // Simplified for example

    if (hook === 'before-query' && context.query) {
      let filteredQuery = context.query;

      if (this.settings.blockProfanity) {
        profanityList.forEach(word => {
          const regex = new RegExp(word, 'gi');
          filteredQuery = filteredQuery.replace(regex, '[REDACTED]');
        });
      }

      return { filteredQuery };
    }

    if (hook === 'before-response' && context.response) {
      let filteredResponse = JSON.stringify(context.response);

      if (this.settings.blockProfanity) {
        profanityList.forEach(word => {
          const regex = new RegExp(word, 'gi');
          filteredResponse = filteredResponse.replace(regex, '[REDACTED]');
        });
      }

      return { filteredResponse: JSON.parse(filteredResponse) };
    }

    return null;
  },

  async cleanup() {
    console.log('Content Filter plugin cleaned up');
  },
};
