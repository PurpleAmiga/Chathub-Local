import React, { useState, useEffect } from 'react';
import PromptStore from '../utils/PromptStore';

interface PromptLibraryProps {
  onSelectPrompt: (promptText: string) => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState<string[]>([]);

  // Load prompt list on component mount
  useEffect(() => {
    const savedPrompts = PromptStore.load();
    setPrompts(savedPrompts);
  }, []);

  // Handle prompt selection from dropdown
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const text = event.target.value;
    if (text) {
      onSelectPrompt(text);
    }
  };

  // Add a new prompt (for simplicity using window.prompt; could be a better UI form)
  const handleAddPrompt = () => {
    const newPrompt = window.prompt("Enter new prompt text:");
    if (newPrompt && newPrompt.trim()) {
      const promptText = newPrompt.trim();
      setPrompts(prev => {
        const updated = [...prev, promptText];
        PromptStore.save(updated);
        return updated;
      });
    }
  };

  return (
    <div className="prompt-library mr-2 flex items-center">
      <label className="mr-1">Prompts:</label>
      <select onChange={handleSelect} value="">
        <option value="" disabled>Select a prompt</option>
        {prompts.map((p, idx) => (
          <option key={idx} value={p}>
            {p.length > 50 ? p.substring(0, 50) + '...' : p}
          </option>
        ))}
      </select>
      <button type="button" onClick={handleAddPrompt} className="btn btn-sm ml-1">
        + Add
      </button>
    </div>
  );
};

export default PromptLibrary;
