const HISTORY_KEY = 'aurora_activity_history';

/**
 * Service to manage local activity history
 */
export const historyService = {
    /**
     * Save a new entry to history
     * @param {string} type - 'oracle', 'generator', or 'analyzer'
     * @param {object} data - The data to store (prompt, result, etc)
     */
    saveEntry(type, data) {
        try {
            const history = this.getHistory();
            const newEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type,
                ...data
            };
            
            // Limit to last 50 entries to keep it light
            const updatedHistory = [newEntry, ...history].slice(0, 50);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
            return newEntry;
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    },

    /**
     * Get all history entries
     * @returns {Array}
     */
    getHistory() {
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    },

    /**
     * Delete a specific entry
     * @param {string} id 
     */
    deleteEntry(id) {
        const history = this.getHistory();
        const updated = history.filter(item => item.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    },

    /**
     * Clear all history
     */
    clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
    }
};
