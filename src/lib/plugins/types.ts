/**
 * Plugin System Types
 * Defines types for the plugin architecture
 */

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: PluginPermission[];
  hooks: PluginHook[];
  settings?: PluginSetting[];
}

export type PluginPermission = 
  | 'network'
  | 'filesystem'
  | 'database'
  | 'api'
  | 'ui';

export type PluginHook = 
  | 'before-query'
  | 'after-query'
  | 'before-response'
  | 'after-response'
  | 'on-settings-change';

export interface PluginSetting {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  description?: string;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  required?: boolean;
}

export interface PluginContext {
  query?: string;
  response?: any;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Plugin {
  manifest: PluginManifest;
  enabled: boolean;
  settings: Record<string, any>;
  initialize?: (context: PluginContext) => Promise<void>;
  execute?: (hook: PluginHook, context: PluginContext) => Promise<any>;
  cleanup?: () => Promise<void>;
}

export interface PluginHookResult {
  success: boolean;
  data?: any;
  error?: string;
}
