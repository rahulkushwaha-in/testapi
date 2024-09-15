const mongoose = require('mongoose')

const TermSchema = new mongoose.Schema({
    term:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
    }
});

module.exports = mongoose.model('Term', TermSchema);