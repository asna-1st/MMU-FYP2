const express = require('express');
const router = express.Router();
const scheduleDB = require('./models/scheduleModel');
const volunteerScheduleDB = require('./models/volunteerScheduleModel');
const eventDB = require('./models/eventModel');
const jwtVerify = require('./middleware/jwtVerify')
const moongose = require('mongoose');

router.post("/create", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);
        const { scheduleName, description, date, startTime, endTime, eventID, maxVolunteer } = req.body;

        const newSchedule = new scheduleDB({
            Name: scheduleName,
            Description: description,
            BeginAt: convertTime(startTime),
            EndAt: convertTime(endTime),
            MaxVolunteer: maxVolunteer,
            EventID: eventID
        });

        await newSchedule.save();
        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/list", jwtVerify([0, 1]), async (req, res) => {
    try {
        console.log(req.body);
        const { eventID } = req.body;

        const schedules = await scheduleDB.find({ EventID: eventID });
        let schedule = [];

        if (res.locals.userType == 1) {
            for (const sch of schedules) {
                // Check if the volunteer is scheduled for this schedule
                const volunteerSchedule = await volunteerScheduleDB
                    .findOne({ ScheduleID: sch._id, VolunteerID: res.locals.userID });
                const volunteerCount = await volunteerScheduleDB
                    .countDocuments({ ScheduleID: sch._id });

                // If volunteerSchedule exists, the volunteer is scheduled for this schedule
                schedule.push({
                    _id: sch._id,
                    Name: sch.Name,
                    BeginAt: sch.BeginAt,
                    EndAt: sch.EndAt,
                    Description: sch.Description,
                    MaxVolunteer: sch.MaxVolunteer,
                    volunteerCount: volunteerCount,
                    isScheduled: !!volunteerSchedule
                });
            }
        } else {
            for (const sch of schedules) {
                // Check if the volunteer is scheduled for this schedule
                const volunteerCount = await volunteerScheduleDB
                    .countDocuments({ ScheduleID: sch._id });

                // If volunteerSchedule exists, the volunteer is scheduled for this schedule
                schedule.push({
                    _id: sch._id,
                    Name: sch.Name,
                    BeginAt: sch.BeginAt,
                    EndAt: sch.EndAt,
                    Description: sch.Description,
                    MaxVolunteer: sch.MaxVolunteer,
                    volunteerCount: volunteerCount,
                });
            }
        }

        res.status(200).json({
            schedule
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/delete", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);
        const { scheduleID } = req.body;

        await scheduleDB.findByIdAndDelete(scheduleID);

        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/detail", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);
        const { scheduleID } = req.body;

        const schedule = await scheduleDB.findById(scheduleID);

        res.status(200).json({ schedule });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/edit", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);
        const { scheduleID, scheduleName, description, date, startTime, endTime, maxVolunteer } = req.body;

        await scheduleDB.findByIdAndUpdate(scheduleID,
            {
                Name: scheduleName,
                Description: description,
                BeginAt: convertTime(startTime),
                EndAt: convertTime(endTime),
                MaxVolunteer: maxVolunteer
            });

        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/join", jwtVerify([1]), async (req, res) => {
    try {
        console.log(req.body);
        const { scheduleID } = req.body;

        const newVolunteerSchedule = new volunteerScheduleDB({
            ScheduleID: scheduleID,
            VolunteerID: res.locals.userID
        });
        await newVolunteerSchedule.save();
        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/volunteer", jwtVerify([1]), async (req, res) => {
    try {
        console.log(res.locals.userID);
        const schedule = await volunteerScheduleDB.aggregate([
            {
                $match: { VolunteerID: new moongose.Types.ObjectId(res.locals.userID) }
            },
            {
                $lookup: {
                    from: "schedules",
                    localField: "ScheduleID",
                    foreignField: "_id",
                    as: "schedule"
                }
            },
            {
                $unwind: '$schedule'
            },
        ]);

        console.log(schedule);

        res.status(200).json({ schedule });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/remove", jwtVerify([0, 1]), async (req, res) => {
    try {
        console.log(req.body);

        if (res.locals.userType == 1) {
            const { volunteerScheduleID } = req.body;

            await volunteerScheduleDB.findByIdAndDelete(volunteerScheduleID);
        } else if (res.locals.userType == 0) {
            const { scheduleID, volunteerID } = req.body;

            await volunteerScheduleDB.findOneAndDelete({ VolunteerID: volunteerID, ScheduleID: scheduleID });
        }
        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/swap", jwtVerify([1]), async (req, res) => {
    try {
        console.log(req.body);

        const { volunteerScheduleID, scheduleID } = req.body;
        await volunteerScheduleDB.findByIdAndUpdate(volunteerScheduleID, { ScheduleID: scheduleID });
        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/volunteer/list", jwtVerify([0]), async (req, res) => {
    try {
        const { scheduleID } = req.body;
        console.log(scheduleID);
        const volunteerSchedule = await volunteerScheduleDB.find({ ScheduleID: scheduleID });

        const populateVolunteer = await volunteerScheduleDB.populate(volunteerSchedule, { path: 'VolunteerID' });

        const volunteerList = populateVolunteer.map(entry => ({
            _id: entry.VolunteerID._id,
            Name: entry.VolunteerID.Name,
            Email: entry.VolunteerID.Email
        }));

        res.status(200).json({ volunteerList });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/event", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);
        const { scheduleID } = req.body;

        const schedule = await scheduleDB.findById(scheduleID).populate('EventID');

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        const event = await eventDB.findById(schedule.EventID);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ event });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

function convertTime(time) {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
}

module.exports = router;