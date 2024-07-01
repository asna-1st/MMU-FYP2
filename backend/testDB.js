const mongoose = require('mongoose');
const eventDB = require('./routes/models/eventModel');
const scheduleDB = require('./routes/models/scheduleModel');
const volunteerDB = require('./routes/models/volunteerModel');
const volunteerScheduleDB = require('./routes/models/volunteerScheduleModel');
const bcrypt = require('bcrypt');

//mongoose.connect('mongodb://127.0.0.1:27017/devTestFYP');

const volunteerIds = [
    '667d7aa329b739292371cd3d',
    '667d7aa329b739292371cd3e',
    '667d7aa329b739292371cd3f',
    '667d7aa329b739292371cd40',
    '667d7aa329b739292371cd41',
    '667d7aa329b739292371cd42',
    '667d7aa329b739292371cd43',
    '667d7aa329b739292371cd44',
    '667d7aa329b739292371cd45',
    '667d7aa329b739292371cd46',
    '667d7aa329b739292371cd47',
    '667d7aa329b739292371cd48',
    '667d7aa329b739292371cd49',
    '667d7aa329b739292371cd4a',
    '667d7aa329b739292371cd4b',
    '667d7aa329b739292371cd4c',
    '667d7aa329b739292371cd4d',
    '667d7aa329b739292371cd4e',
    '667d7aa329b739292371cd4f',
    '667d7aa329b739292371cd50',
    '667d7aa329b739292371cd51',
    '667d7aa329b739292371cd52',
    '667d7aa329b739292371cd53',
    '667d7aa329b739292371cd54',
    '667d7aa329b739292371cd55',
    '667d7aa329b739292371cd56',
    '667d7aa329b739292371cd57',
    '667d7aa329b739292371cd58',
    '667d7aa329b739292371cd59'
];

const scheduleIds = [
    '667d7df2f5ca89240582be91',
    '667d7e2df5ca89240582be95',
    '667d7e62f5ca89240582be9a',
    '667d7ebbf5ca89240582bea9',
    '667d7edef5ca89240582bead',
    '667d84f7f5ca89240582bf0b',
    '667d8516f5ca89240582bf0f',
    '667d8540f5ca89240582bf14'
];

async function assignVolunteers() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/devTestFYP');

        for (let i = 0; i < volunteerIds.length; i++) {
            const volunteerId = volunteerIds[i];
            const scheduleId = scheduleIds[i % scheduleIds.length];

            const volunteerSchedule = new volunteerScheduleDB({
                VolunteerID: volunteerId,
                ScheduleID: scheduleId
            });

            await volunteerSchedule.save();

            console.log(`Assigned volunteer ${volunteerId} to schedule ${scheduleId}`);
        }
    } catch (error) {
        console.error('Error assigning volunteers:', error);
    } finally {
        await mongoose.disconnect();
    }
}

assignVolunteers();