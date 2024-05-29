const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    Message: String,
    EventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType',
    },
    userType: {
        type: String,
        required: true,
        enum: ['Volunteer', 'Organization'],
    }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', chatSchema);

module.exports = Message;