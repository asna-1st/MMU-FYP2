const express = require('express');
const router = express.Router();
const Schedule = require('./models/scheduleModel');
const VolunteerSchedule = require('./models/volunteerScheduleModel');
const Volunteer = require('./models/volunteerModel');
const Event = require('./models/eventModel');
const mongoose = require('mongoose');

router.get("/event/:eventID/schedule", async (req, res) => {
    try {
        const eventId = req.params.eventID;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const schedules = await Schedule.find({ EventID: eventId }).lean();

        const volunteerSchedules = await VolunteerSchedule.find({}).lean();

        const response = await Promise.all(
            schedules.map(async (schedule) => {
                const volunteerCount = await VolunteerSchedule.countDocuments({
                    ScheduleID: schedule._id,
                });
                const remainingSlots = schedule.MaxVolunteer - volunteerCount;

                return {
                    _id: schedule._id,
                    Name: schedule.Name,
                    BeginAt: schedule.BeginAt,
                    EndAt: schedule.EndAt,
                    Description: schedule.Description,
                    MaxVolunteer: schedule.MaxVolunteer,
                    volunteerCount,
                    remainingSlots,
                };
            })
        );

        res.json(response);
    } catch (error) {
        console.error('Error retrieving schedules for event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post("/swap", async (req, res) => {
    try {
        const { volunteerID, scheduleID } = req.body;

        const newJobSchedule = await Schedule.findById(scheduleID);
        const newEventID = newJobSchedule.EventID;

        await VolunteerSchedule.deleteMany({
            VolunteerID: volunteerID,
            ScheduleID: { $in: (await Schedule.find({ EventID: newEventID })) }
        });

        //const volunteerScheduleCount = await VolunteerSchedule.countDocuments({scheduleID: scheduleID});

        const newVolunteerSchedule = new VolunteerSchedule({
            VolunteerID: volunteerID,
            ScheduleID: scheduleID,
        });

        await newVolunteerSchedule.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error retrieving schedules for event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;