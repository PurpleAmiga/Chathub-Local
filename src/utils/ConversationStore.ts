class ConversationStore {
  static save(botId: string, messages: any[]) {
    try {
      const key = `conv_${botId}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save conversation data:', e);
    }
  }

  static load(botId: string): any[] {
    try {
      const key = `conv_${botId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load conversation data:', e);
      return [];
    }
  }

  static clear(botId: string) {
    try {
      const key = `conv_${botId}`;
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear conversation data:', e);
    }
  }
}

export default ConversationStore;
