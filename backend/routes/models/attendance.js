const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    VolunteerScheduleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VolunteerSchedule',
    },
    Date: {
        type: Date,
        validate: {
            validator: async function(date) {
                // Retrieve the event start and end dates
                const volunteerSchedule = await this.model('VolunteerSchedule').findById(this.VolunteerScheduleID).populate({
                    path: 'ScheduleID',
                    populate: {
                        path: 'EventID',
                        select: 'StartDate EndDate'
                    }
                });

                if (!volunteerSchedule) {
                    return false; // Invalid volunteer schedule ID
                }

                const { ScheduleID } = volunteerSchedule;
                const { EventID } = ScheduleID;
                const { StartDate, EndDate } = EventID;

                // Check if the date falls within the event date range
                return date >= StartDate && date <= EndDate;
            },
            message: props => `Attendance date is not within the event date range.`,
        },
    },
    CheckIn: Date,
    CheckOut: Date,
});

attendanceSchema.index({ VolunteerScheduleID: 1, Date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;