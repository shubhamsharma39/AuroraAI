const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.generateContent = async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/generate-content`, req.body);
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
        res.json(response.data);
    } catch (error) {
        console.error('Error in universalChat:', error.message);
        res.status(500).json({ error: 'AI Service error' });
    }
};
