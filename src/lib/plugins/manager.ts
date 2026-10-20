/**
 * Plugin Manager
 * Manages plugin lifecycle and execution
 */

import { Plugin, PluginManifest, PluginHook, PluginContext, PluginHookResult } from './types';

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<PluginHook, string[]> = new Map();

  async registerPlugin(plugin: Plugin): Promise<boolean> {
    try {
      // Validate plugin manifest
      if (!plugin.manifest || !plugin.manifest.id) {
        throw new Error('Invalid plugin manifest');
      }

      // Check if plugin already exists
      if (this.plugins.has(plugin.manifest.id)) {
        throw new Error(`Plugin ${plugin.manifest.id} already registered`);
      }

      // Initialize plugin
      if (plugin.initialize) {
        await plugin.initialize({});
      }

      // Register plugin
      this.plugins.set(plugin.manifest.id, plugin);

      // Register hooks
      plugin.manifest.hooks.forEach(hook => {
        if (!this.hooks.has(hook)) {
          this.hooks.set(hook, []);
        }
        this.hooks.get(hook)!.push(plugin.manifest.id);
      });

      return true;
    } catch (error) {
      console.error(`Failed to register plugin:`, error);
      return false;
    }
  }

  async unregisterPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      // Cleanup plugin
      if (plugin.cleanup) {
        await plugin.cleanup();
      }

      // Unregister hooks
      plugin.manifest.hooks.forEach(hook => {
        const hooks = this.hooks.get(hook);
        if (hooks) {
          const index = hooks.indexOf(pluginId);
          if (index > -1) {
            hooks.splice(index, 1);
          }
        }
      });

      // Remove plugin
      this.plugins.delete(pluginId);

      return true;
    } catch (error) {
      console.error(`Failed to unregister plugin:`, error);
      return false;
    }
  }

  async executeHook(hook: PluginHook, context: PluginContext): Promise<PluginHookResult[]> {
    const results: PluginHookResult[] = [];
    const pluginIds = this.hooks.get(hook) || [];

    for (const pluginId of pluginIds) {
      const plugin = this.plugins.get(pluginId);
      
      if (!plugin || !plugin.enabled) {
        continue;
      }

      try {
        if (plugin.execute) {
          const result = await plugin.execute(hook, context);
          results.push({
            success: true,
            data: result,
          });
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter(p => p.enabled);
  }

  async enablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    plugin.enabled = true;
    return true;
  }

  async disablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    plugin.enabled = false;
    return true;
  }

  async updatePluginSettings(pluginId: string, settings: Record<string, any>): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    plugin.settings = { ...plugin.settings, ...settings };
    return true;
  }

  getPluginSettings(pluginId: string): Record<string, any> | undefined {
    const plugin = this.plugins.get(pluginId);
    return plugin?.settings;
  }
}

export const pluginManager = new PluginManager();
