/**
 * Settings Export/Import
 * Handles exporting and importing application settings
 */

import configManager from '../config';

export interface ExportedSettings {
  version: number;
  exportDate: string;
  settings: any;
  preferences: any;
  personalization: any;
  modelProviders: any[];
  customAgents?: any[];
}

export class SettingsExporter {
  async exportSettings(): Promise<ExportedSettings> {
    const config = configManager.currentConfig;

    const exported: ExportedSettings = {
      version: config.version,
      exportDate: new Date().toISOString(),
      settings: config,
      preferences: config.preferences,
      personalization: config.personalization,
      modelProviders: config.modelProviders,
    };

    // Include custom agents if available
    try {
      const agentsResponse = await fetch('/api/agents');
      if (agentsResponse.ok) {
        const agents = await agentsResponse.json();
        exported.customAgents = agents;
      }
    } catch (error) {
      console.error('Error fetching custom agents for export:', error);
    }

    return exported;
  }

  async importSettings(data: ExportedSettings): Promise<boolean> {
    try {
      // Validate version compatibility
      if (data.version !== configManager.currentConfig.version) {
        console.warn('Settings version mismatch, attempting import anyway');
      }

      // Import settings using config manager's updateConfig method
      for (const [key, value] of Object.entries(data.preferences)) {
        configManager.updateConfig(`preferences.${key}`, value);
      }
      for (const [key, value] of Object.entries(data.personalization)) {
        configManager.updateConfig(`personalization.${key}`, value);
      }
      
      // Import model providers
      for (const provider of data.modelProviders) {
        configManager.currentConfig.modelProviders.push(provider);
      }
      
      // Save the updated config
      (configManager as any).saveConfig();

      // Import custom agents if available
      if (data.customAgents && data.customAgents.length > 0) {
        for (const agent of data.customAgents) {
          try {
            await fetch('/api/agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(agent),
            });
          } catch (error) {
            console.error('Error importing custom agent:', error);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  exportToFile(): void {
    this.exportSettings().then(settings => {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `vane-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    });
  }

  importFromFile(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const success = await this.importSettings(data);
          resolve(success);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export const settingsExporter = new SettingsExporter();
