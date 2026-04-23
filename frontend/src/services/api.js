import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // Node.js Backend
});

export const aiService = {
    generateContent: (data) => api.post('/generate-content', data),
    uploadDocument: (formData) => api.post('/upload-document', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    askDocument: (data) => api.post('/ask-document', data),
    universalChat: (data) => api.post('/universal-chat', data),
    
    // History methods
    getHistory: () => api.get('/history'),
    getSystemStatus: () => api.get('/status'),
    deleteHistory: (id) => api.delete(`/history/${id}`),
    clearAllHistory: () => api.delete('/history/all'),
};

export default api;
