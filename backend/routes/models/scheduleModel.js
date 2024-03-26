const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    Name: String,
    BeginAt: Date,
    EndAt: Date,
    Description: String,
    MaxVolunteer: Number,
    EventID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
})

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;