'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Bot, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  systemInstructions: string;
  preferredModel: string;
  preferredMode: 'speed' | 'balanced' | 'quality';
  createdAt: string;
  context: Record<string, any>;
}

const AgentManager = () => {
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Partial<CustomAgent>>({});

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingAgent.id ? 'PUT' : 'POST';
      const response = await fetch('/api/agents', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAgent),
      });

      if (response.ok) {
        toast.success(editingAgent.id ? 'Agent updated successfully' : 'Agent created successfully');
        setIsEditing(false);
        setEditingAgent({});
        fetchAgents();
      } else {
        toast.error('Failed to save agent');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error('Failed to save agent');
    }
  };

  const handleEdit = (agent: CustomAgent) => {
    setEditingAgent(agent);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await fetch(`/api/agents?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Agent deleted successfully');
        fetchAgents();
      } else {
        toast.error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingAgent({});
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Custom Agents</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New Agent
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
            {editingAgent.id ? 'Edit Agent' : 'Create New Agent'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Name</label>
              <input
                type="text"
                value={editingAgent.name || ''}
                onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                placeholder="e.g., Research Assistant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">Description</label>
              <input
                type="text"
                value={editingAgent.description || ''}
                onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                placeholder="Brief description of this agent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">System Instructions</label>
              <textarea
                value={editingAgent.systemInstructions || ''}
                onChange={(e) => setEditingAgent({ ...editingAgent, systemInstructions: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white min-h-[120px]"
                placeholder="Define the agent's behavior and personality"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Preferred Model</label>
                <input
                  type="text"
                  value={editingAgent.preferredModel || ''}
                  onChange={(e) => setEditingAgent({ ...editingAgent, preferredModel: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                  placeholder="e.g., gpt-4, llama3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">Preferred Mode</label>
                <select
                  value={editingAgent.preferredMode || 'balanced'}
                  onChange={(e) => setEditingAgent({ ...editingAgent, preferredMode: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                >
                  <option value="speed">Speed</option>
                  <option value="balanced">Balanced</option>
                  <option value="quality">Quality</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-light-200 dark:border-dark-200 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors text-black dark:text-white"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={18} />
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-5 border border-light-200 dark:border-dark-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot size={24} className="text-blue-600" />
                <h3 className="font-semibold text-lg text-black dark:text-white">{agent.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(agent)}
                  className="p-1.5 hover:bg-light-primary dark:hover:bg-dark-primary rounded transition-colors"
                >
                  <Edit size={16} className="text-black/60 dark:text-white/60" />
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="p-1.5 hover:bg-light-primary dark:hover:bg-dark-primary rounded transition-colors"
                >
                  <Trash size={16} className="text-red-600" />
                </button>
              </div>
            </div>
            <p className="text-sm text-black/60 dark:text-white/60 mb-3">{agent.description}</p>
            <div className="flex items-center gap-2 text-xs text-black/40 dark:text-white/40">
              <span className="px-2 py-1 bg-light-primary dark:bg-dark-primary rounded">{agent.preferredMode}</span>
              <span className="px-2 py-1 bg-light-primary dark:bg-dark-primary rounded">{agent.preferredModel}</span>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && !isEditing && (
        <div className="text-center py-12 text-black/50 dark:text-white/50">
          <Bot size={48} className="mx-auto mb-4 opacity-50" />
          <p>No custom agents yet. Create your first agent to get started!</p>
        </div>
      )}
    </div>
  );
};

export default AgentManager;
