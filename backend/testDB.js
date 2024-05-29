const mongoose = require('mongoose');
const eventDB = require('./routes/models/eventModel');
const scheduleDB = require('./routes/models/scheduleModel');
const volunteerDB = require('./routes/models/volunteerModel');
const volunteerScheduleDB = require('./routes/models/volunteerScheduleModel');

mongoose.connect('mongodb://127.0.0.1:27017/devTestFYP');

async function listSchedulesAndCheckVolunteer(eventId, volunteerId) {
    try {
        const result = [];
        // Find all schedules in the given event
        const schedules = await scheduleDB.find({ EventID: eventId });

        // Loop through each schedule
        for (const schedule of schedules) {
            // Check if the volunteer is scheduled for this schedule
            const volunteerSchedule = await volunteerScheduleDB
                .findOne({ ScheduleID: schedule._id, VolunteerID: volunteerId });
            const volunteerCount = await volunteerScheduleDB
                .countDocuments({ ScheduleID: schedule._id });

            // If volunteerSchedule exists, the volunteer is scheduled for this schedule
            result.push({
                _id: schedule._id,
                Name: schedule.Name,
                BeginAt: schedule.BeginAt,
                EndAt: schedule.EndAt,
                Description: schedule.Description,
                MaxVolunteer: schedule.MaxVolunteer,
                volunteerCount: volunteerCount,
                isScheduled: !!volunteerSchedule
            });
        }
        return result;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Example usage:
// Assuming eventId and volunteerId are known
const eventId = '6609a47591edb23916d260e4'; // Provide the event ID
const volunteerId = '660d53797d46da751df6a6cb'; // Provide the volunteer ID

// Call the function
listSchedulesAndCheckVolunteer(eventId, volunteerId)
    .then(result => console.log(result))
    .catch(error => console.error(error));