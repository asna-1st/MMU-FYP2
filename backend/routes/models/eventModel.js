const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    Name: String,
    CreateAt: Date,
    StartDate: Date,
    EndDate: Date,
    Description: String,
    Address: String,
    Country: String,
    OrganizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
    },
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;