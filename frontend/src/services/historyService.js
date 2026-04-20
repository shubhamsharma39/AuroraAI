import { aiService } from './api';

/**
 * Service to manage activity history via Backend API
 */
export const historyService = {
    /**
     * Save is now handled automatically by the backend controllers
     * when an action is performed. This remains for interface compatibility.
     */
    saveEntry(_type, _data) {
        // Automatically handled by backend
        return null;
    },

    /**
     * Get all history entries from backend
     * @returns {Promise<Array>}
     */
    async getHistory() {
        try {
            const response = await aiService.getHistory();
            return response.data;
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    },

    /**
     * Delete a specific entry
     * @param {string} id 
     */
    async deleteEntry(id) {
        try {
            await aiService.deleteHistory(id);
        } catch (error) {
            console.error('Failed to delete entry:', error);
        }
    },

    /**
     * Clear all history
     */
    async clearHistory() {
        try {
            await aiService.clearAllHistory();
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    }
};
