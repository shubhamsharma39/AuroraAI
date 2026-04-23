const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');

const upload = multer({ dest: 'uploads/' });

// API Root Status
router.get('/', (req, res) => {
    res.json({ 
        message: 'AuroraAI API is operational',
        version: 'v2.0',
        available_endpoints: [
            '/history', 
            '/generate-content', 
            '/universal-chat', 
            '/ask-document'
        ]
    });
});

router.get('/status', aiController.getSystemStatus);
router.post('/generate-content', aiController.generateContent);
router.post('/upload-document', upload.single('file'), aiController.uploadDocument);
router.post('/ask-document', aiController.askDocument);
router.post('/universal-chat', aiController.universalChat);

// History Routes
router.get('/history', aiController.getHistory);
router.delete('/history/all', aiController.clearAllHistory);
router.delete('/history/:id', aiController.deleteHistoryEntry);

module.exports = router;
