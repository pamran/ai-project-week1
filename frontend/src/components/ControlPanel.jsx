import React, { useState } from 'react';

function ControlPanel({
  isActive,
  isPaused,
  onStart,
  onReset,
  onPause,
  onResume
}) {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [topic, setTopic] = useState('');
  const [startingLLM, setStartingLLM] = useState('llm1');

  const handleStart = () => {
    if (topic.trim()) {
      onStart(topic.trim(), startingLLM);
      setShowStartDialog(false);
      setTopic('');
    }
  };

  return (
    <div className="control-panel">
      {!isActive ? (
        <button
          className="control-button start-button"
          onClick={() => setShowStartDialog(true)}
        >
          Start Conversation
        </button>
      ) : (
        <div className="control-buttons">
          {isPaused ? (
            <button
              className="control-button resume-button"
              onClick={onResume}
            >
              Resume
            </button>
          ) : (
            <button
              className="control-button pause-button"
              onClick={onPause}
            >
              Pause
            </button>
          )}
          <button
            className="control-button reset-button"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      )}

      {showStartDialog && (
        <div className="start-dialog-overlay" onClick={() => setShowStartDialog(false)}>
          <div className="start-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Start New Conversation</h3>
            <div className="dialog-field">
              <label>Conversation Topic / Prompt:</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., What is the nature of consciousness?"
                rows={3}
              />
            </div>
            <div className="dialog-field">
              <label>Starting LLM:</label>
              <select
                value={startingLLM}
                onChange={(e) => setStartingLLM(e.target.value)}
              >
                <option value="llm1">LLM 1</option>
                <option value="llm2">LLM 2</option>
              </select>
            </div>
            <div className="dialog-buttons">
              <button
                className="dialog-button primary"
                onClick={handleStart}
                disabled={!topic.trim()}
              >
                Start
              </button>
              <button
                className="dialog-button"
                onClick={() => setShowStartDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlPanel;

