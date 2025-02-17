import React, { useState, useRef, useEffect } from 'react';
import ConversationStore from '../utils/ConversationStore';
import PromptLibrary from './PromptLibrary';
import ChatService from '../services/ChatService';

interface Message {
  id: number;
  sender: string;
  text: string;
}

interface ChatWindowProps {
  bot: { id: string, name: string /* other bot config as needed */ };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ bot }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load saved conversation on mount (if any exists for this bot)
  useEffect(() => {
    const saved = ConversationStore.load(bot.id);
    if (saved && saved.length) {
      setMessages(saved);
    }
  }, [bot.id]);

  // Save conversation to local storage whenever messages change (if not empty)
  useEffect(() => {
    if (messages.length > 0) {
      ConversationStore.save(bot.id, messages);
    }
  }, [messages, bot.id]);

  // Auto-scroll to bottom whenever a new message is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    // Append user message to the chat
    const userMsg: Message = {
      id: Date.now(),  // simple unique ID based on timestamp
      sender: 'User',
      text: input.trim()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare to send message via ChatService
    const controller = new AbortController();
    setAbortCtrl(controller);
    try {
      const responseText = await ChatService.sendMessage(bot, userMsg.text, controller.signal);
      // Append bot's response to chat if not aborted
      const botMsg: Message = {
        id: Date.now() + 1,  // ensure different ID
        sender: bot.name,
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error or aborted response:', error);
      // (If needed) handle any cleanup or user notification on error
    } finally {
      setLoading(false);
      setAbortCtrl(null);
    }
  };

  const handleStop = () => {
    // Abort the in-progress response (if any)
    if (abortCtrl) {
      abortCtrl.abort();
      setAbortCtrl(null);
    }
    setLoading(false);
  };

  const handleClear = () => {
    // Clear the current conversation
    setMessages([]);
    ConversationStore.clear(bot.id);
    // Reset bot context if needed (for example, reset conversation ID for APIs)
    ChatService.resetConversation(bot);
  };

  return (
    <div className="chat-window">
      {/* Header with bot name and control buttons */}
      <div className="chat-header flex items-center justify-between p-2 bg-gray-100">
        <strong>{bot.name}</strong>
        <div>
          <button onClick={handleClear} disabled={loading} className="btn btn-sm mr-2">
            Clear Chat
          </button>
          {loading && (
            <button onClick={handleStop} className="btn btn-sm btn-red">
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Messages list */}
      <div className="chat-messages p-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`message mb-2 ${msg.sender === 'User' ? 'text-right' : 'text-left'}`}>
            <span className="font-semibold">{msg.sender}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />  {/* Dummy div to auto-scroll to */}
      </div>

      {/* Input area with PromptLibrary and Send button */}
      <div className="chat-input border-t p-2 bg-gray-50 flex items-center">
        <PromptLibrary onSelectPrompt={(prompt) => setInput(prompt)} />
        <textarea 
          className="flex-grow border rounded p-1 mx-2" 
          rows={2} 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
