const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Activity = require('../models/Activity');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.generateContent = async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/generate-content`, req.body);
        
        // Save to History
        await Activity.create({
            type: 'generator',
            data: {
                topic: req.body.topic,
                tone: req.body.tone,
                type_of_content: req.body.type,
                result: response.data.content
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error in generateContent:', error.message);
        res.status(500).json({ error: 'AI Service error' });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        const response = await axios.post(`${AI_SERVICE_URL}/upload-document`, formData, {
            headers: formData.getHeaders(),
        });

        // Save to History
        await Activity.create({
            type: 'analyzer',
            data: {
                filename: response.data.filename,
                doc_id: response.data.doc_id,
                summary: response.data.summary
            }
        });

        // Clean up local temp file
        fs.unlinkSync(req.file.path);

        res.json(response.data);
    } catch (error) {
        console.error('Error in uploadDocument:', error.message);
        res.status(500).json({ error: 'AI Service error' });
    }
};

exports.askDocument = async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/ask-document`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error in askDocument:', error.message);
        res.status(500).json({ error: 'AI Service error' });
    }
};

exports.universalChat = async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/universal-chat`, req.body);
        
        // Save to History
        await Activity.create({
            type: 'oracle',
            data: {
                query: req.body.message,
                answer: response.data.answer
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error in universalChat:', error.message);
        res.status(500).json({ error: 'AI Service error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await Activity.find().sort({ timestamp: -1 }).limit(50);
        // Map to flat structure for frontend compatibility
        const flattened = history.map(item => ({
            id: item._id,
            timestamp: item.timestamp,
            type: item.type,
            ...item.data
        }));
        res.json(flattened);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

exports.deleteHistoryEntry = async (req, res) => {
    try {
        await Activity.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete entry' });
    }
};

exports.getSystemStatus = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        let aiStatus = 'offline';
        try {
            const aiRes = await axios.get(AI_SERVICE_URL, { timeout: 2000 });
            if (aiRes.status === 200) aiStatus = 'online';
        } catch (e) {
            aiStatus = 'offline';
        }

        res.json({
            status: 'success',
            backend: 'online',
            mongodb: dbStatus,
            ai_engine: aiStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch system status' });
    }
};

exports.clearAllHistory = async (req, res) => {
    try {
        await Activity.deleteMany({});
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear history' });
    }
};
