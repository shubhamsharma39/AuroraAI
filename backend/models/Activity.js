const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['oracle', 'generator', 'analyzer']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    // Generic data object to store various fields based on type
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

module.exports = mongoose.model('Activity', activitySchema);
