const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    username: String,
    message: String,
    eventID: String,
}, {
    timestamps: true
})

const Message = mongoose.model('Message', chatSchema);

module.exports = Message;