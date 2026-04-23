import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    // Fallback for production: use the current server's IP/hostname
    if (import.meta.env.MODE === 'production') {
        return `http://${window.location.hostname}:5000/api`;
    }
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
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
