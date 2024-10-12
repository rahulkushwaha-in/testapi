const mongoose = require('mongoose')

const TermSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    synonyms: {
        type: [String], // Array of synonyms
        default: [],
    },
});

module.exports = mongoose.model('Term', TermSchema);