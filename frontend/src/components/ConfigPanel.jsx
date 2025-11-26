import React, { useState } from 'react';

function ConfigPanel({ title, config, onChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (updates) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="config-panel">
      <div className="config-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>{title}</h3>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="config-content">
          <div className="config-field">
            <label>Provider:</label>
            <select
              value={config.provider}
              onChange={(e) => updateConfig({ provider: e.target.value })}
            >
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="config-field">
            <label>API Key:</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
              placeholder="Enter API key"
            />
          </div>

          <div className="config-field">
            <label>Model:</label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => updateConfig({ model: e.target.value })}
              placeholder={
                config.provider === 'deepseek'
                  ? 'deepseek-chat'
                  : 'gpt-3.5-turbo'
              }
            />
          </div>

          <div className="config-field">
            <label>
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) =>
                updateConfig({ temperature: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="config-field">
            <label>Max Tokens:</label>
            <input
              type="number"
              min="1"
              max="4000"
              value={config.maxTokens}
              onChange={(e) =>
                updateConfig({ maxTokens: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="config-field">
            <label>System Prompt / Character:</label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
              placeholder="You are a helpful AI assistant."
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfigPanel;

