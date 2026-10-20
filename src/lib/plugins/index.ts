/**
 * Plugin System
 * Exports plugin manager and built-in plugins
 */

export { pluginManager, PluginManager } from './manager';
export * from './types';
export { queryLoggerPlugin } from './builtin/queryLogger';
export { contentFilterPlugin } from './builtin/contentFilter';

// Initialize built-in plugins
import { pluginManager } from './manager';
import { queryLoggerPlugin } from './builtin/queryLogger';
import { contentFilterPlugin } from './builtin/contentFilter';

export async function initializeBuiltInPlugins() {
  await pluginManager.registerPlugin(queryLoggerPlugin);
  await pluginManager.registerPlugin(contentFilterPlugin);
}
