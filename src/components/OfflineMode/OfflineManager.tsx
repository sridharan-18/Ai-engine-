'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const OfflineManager = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineEnabled, setOfflineEnabled] = useState(false);
  const [useLocalLLM, setUseLocalLLM] = useState(false);
  const [cacheStats, setCacheStats] = useState({ size: 0, count: 0 });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    // Load settings from localStorage
    const offlineSetting = localStorage.getItem('offlineEnabled');
    const localLLMSetting = localStorage.getItem('useLocalLLM');
    if (offlineSetting) setOfflineEnabled(JSON.parse(offlineSetting));
    if (localLLMSetting) setUseLocalLLM(JSON.parse(localLLMSetting));

    fetchCacheStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/cache/stats');
      if (response.ok) {
        const stats = await response.json();
        setCacheStats(stats);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const toggleOfflineMode = () => {
    const newValue = !offlineEnabled;
    setOfflineEnabled(newValue);
    localStorage.setItem('offlineEnabled', JSON.stringify(newValue));
    toast.success(newValue ? 'Offline mode enabled' : 'Offline mode disabled');
  };

  const toggleLocalLLM = () => {
    const newValue = !useLocalLLM;
    setUseLocalLLM(newValue);
    localStorage.setItem('useLocalLLM', JSON.stringify(newValue));
    toast.success(newValue ? 'Local LLM enabled' : 'Local LLM disabled');
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached queries?')) return;

    try {
      const response = await fetch('/api/cache', { method: 'DELETE' });
      if (response.ok) {
        toast.success('Cache cleared successfully');
        setCacheStats({ size: 0, count: 0 });
      } else {
        toast.error('Failed to clear cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Offline Mode</h2>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi size={20} />
              <span className="text-sm">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <WifiOff size={20} />
              <span className="text-sm">Offline</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Offline Mode Toggle */}
        <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-5 border border-light-200 dark:border-dark-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <WifiOff size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-black dark:text-white">Enable Offline Mode</h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Cache queries and use local LLMs when offline
                </p>
              </div>
            </div>
            <button
              onClick={toggleOfflineMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                offlineEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  offlineEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Local LLM Toggle */}
        <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-5 border border-light-200 dark:border-dark-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-black dark:text-white">Use Local LLM (Ollama)</h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Use local LLM when offline for better privacy
                </p>
              </div>
            </div>
            <button
              onClick={toggleLocalLLM}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                useLocalLLM ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  useLocalLLM ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Cache Stats */}
        <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-5 border border-light-200 dark:border-dark-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Database size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white">Query Cache</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                {cacheStats.count} cached queries • {(cacheStats.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={clearCache}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={18} />
            Clear Cache
          </button>
        </div>

        {!isOnline && offlineEnabled && (
          <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <WifiOff size={20} className="text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  You are currently offline
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Using cached queries and local LLM if enabled
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineManager;
