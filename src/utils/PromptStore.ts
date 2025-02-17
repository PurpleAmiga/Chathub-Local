class PromptStore {
  private static STORAGE_KEY = 'prompt_list';

  static save(prompts: string[]) {
    try {
      localStorage.setItem(PromptStore.STORAGE_KEY, JSON.stringify(prompts));
    } catch (e) {
      console.error('Failed to save prompts:', e);
    }
  }

  static load(): string[] {
    try {
      const data = localStorage.getItem(PromptStore.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load prompts:', e);
      return [];
    }
  }
}

export default PromptStore;
