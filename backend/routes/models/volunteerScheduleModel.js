const mongoose = require('mongoose');

const volunteerScheduleSchema = new mongoose.Schema({
    ScheduleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
      },
      VolunteerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
      }
});

const VolunteerSchedule = mongoose.model('VolunteerSchedule', volunteerScheduleSchema);

module.exports = VolunteerSchedule;