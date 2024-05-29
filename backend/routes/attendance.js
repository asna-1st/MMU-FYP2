const express = require('express');
const router = express.Router();
const jwtVerify = require('./middleware/jwtVerify');
const moongose = require('mongoose');
const eventDB = require('./models/eventModel');
const scheduleDB = require('./models/scheduleModel');
const volunteerScheduleDB = require('./models/volunteerScheduleModel');
const attendanceDB = require('./models/attendance');
const Attendance = require('./models/attendance');
const { getIO } = require('../socketio/chatSocketIO');
const jwt = require('jsonwebtoken');
const VolunteerSchedule = require('./models/volunteerScheduleModel');

const io = getIO();

router.post("/detail", jwtVerify([1]), async (req, res) => {
    try {
        console.log(req.body);

        const { volScheduleID } = req.body;

        const volunteerSchedule = await volunteerScheduleDB.findById(volScheduleID)
            .populate({
                path: 'ScheduleID',
                select: 'Name BeginAt EndAt',
                populate: {
                    path: 'EventID',
                    select: 'Name StartDate EndDate'
                }
            });

        if (!volunteerSchedule) {
            throw new Error('Volunteer Schedule not found.');
        }

        console.log(volunteerSchedule)

        const eventData = {
            eventName: volunteerSchedule.ScheduleID.EventID.Name,
            eventStartDate: volunteerSchedule.ScheduleID.EventID.StartDate,
            eventEndDate: volunteerSchedule.ScheduleID.EventID.EndDate,
            scheduleName: volunteerSchedule.ScheduleID.Name,
            scheduleBeginAt: volunteerSchedule.ScheduleID.BeginAt,
            scheduleEndAt: volunteerSchedule.ScheduleID.EndAt
        };
        res.status(201).json({ eventData });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

function startOfDay(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
}

router.post("/", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);

        const { volScheduleToken } = req.body;
        let volScheduleID;

        const decoded = jwt.verify(volScheduleToken, "098dffdg9899");

        console.log("Decoded token:", decoded);
        volScheduleID = decoded.volScheduleID;

        const currentDate = new Date();

        const volunteerSchedule = await volunteerScheduleDB.findById(volScheduleID).populate({
            path: 'ScheduleID',
            populate: {
                path: 'EventID',
                select: 'StartDate EndDate'
            }
        }).populate('VolunteerID');

        if (!volunteerSchedule) {
            return res.status(404).json({ success: false, message: 'Invalid volunteer schedule ID.' });
        }

        const { ScheduleID, VolunteerID } = volunteerSchedule;
        const { EventID } = ScheduleID;
        const { StartDate, EndDate } = EventID;
        console.log(VolunteerID.Name);

        if (currentDate <= StartDate || currentDate >= EndDate) {
            return res.status(400).json({ success: false, message: 'Attendance date is not within the event date range.' });
        }

        let existingAttendance = await attendanceDB.findOne({ VolunteerScheduleID: volScheduleID, Date: startOfDay(currentDate) });

        if (!existingAttendance) {
            existingAttendance = new Attendance({
                VolunteerScheduleID: volScheduleID,
                Date: startOfDay(currentDate),
                CheckIn: currentDate
            });
            await existingAttendance.save();
            io.to(volScheduleID).emit('attendance', { volStatus: 'checked-in' });
            return res.json({ success: true, message: 'Successfully checked in.', volName: VolunteerID.Name, attStatus: "Check-In" });
        } else {
            if (existingAttendance.CheckIn && existingAttendance.CheckOut) {
                return res.status(400).json({ success: false, message: 'Attendance for this date is already fully taken.' });
            }
            // If check-in time is not set, update it
            if (!existingAttendance.CheckIn) {
                existingAttendance.CheckIn = currentDate;
                await existingAttendance.save();
                io.to(volScheduleID).emit('attendance', { volStatus: 'checked-in' });
                return res.status(201).json({ success: true, message: 'Successfully checked in.', volName: VolunteerID.Name, attStatus: "Check-In" });
            }
            // If check-out time is not set, update it
            if (!existingAttendance.CheckOut) {
                existingAttendance.CheckOut = currentDate;
                await existingAttendance.save();
                io.to(volScheduleID).emit('attendance', { volStatus: 'checked-out' });
                return res.status(201).json({ success: true, message: 'Successfully checked out.', volName: VolunteerID.Name, attStatus: "Check-Out" });
            }
        }
    } catch (err) {
        console.log(err);
        if (err instanceof jwt.NotBeforeError) {
            return res.status(400).json({ success: false, message: 'Attedance is not ready.' });
        } else if (err instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ success: false, message: 'Attendance cannot be used' });
        } else {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

router.post('/info', jwtVerify([0, 1]), async (req, res) => {
    console.log(req.body)
    try {
        const { volScheduleID } = req.body;
        const volunteerSchedule = await volunteerScheduleDB.findById(volScheduleID).populate({
            path: 'ScheduleID',
            populate: {
                path: 'EventID',
                select: 'StartDate EndDate'
            }
        });

        res.status(201).json(volunteerSchedule);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/status/list', jwtVerify([0, 1]), async (req, res) => {
    console.log(req.body)
    try {
        const { volScheduleID } = req.body;
        const attendances = await attendanceDB.find({ VolunteerScheduleID: volScheduleID });
        res.status(201).json(attendances);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/manual', jwtVerify([0]), async (req, res) => {
    console.log(req.body);

    const { scheduleID, date } = req.body;
    const parsedDate = new Date(date);
    const startOfDay = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate(), 23, 59, 59));

    try {
        // Find all volunteers associated with the schedule
        // Step 1: Fetch all volunteers associated with the schedule
        const volunteerSchedules = await VolunteerSchedule.find({ ScheduleID: scheduleID }).populate('VolunteerID');

        // Step 2: Fetch attendance records for the specific date
        const attendanceRecords = await Attendance.find({
            Date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate({
            path: 'VolunteerScheduleID',
            populate: {
                path: 'VolunteerID'
            }
        });

        // Step 3: Create a map of volunteer schedule IDs to their attendance records
        const attendanceMap = new Map();
        attendanceRecords.forEach(record => {
            attendanceMap.set(record.VolunteerScheduleID._id.toString(), record);
        });

        // Step 4: Combine the volunteer list with their attendance records
        const result = volunteerSchedules.map(volSchedule => ({
            VolunteerID: volSchedule.VolunteerID,
            Attendance: attendanceMap.has(volSchedule._id.toString())
                ? [attendanceMap.get(volSchedule._id.toString())]
                : []
        }));

        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/manual/toggle', jwtVerify([0]), async (req, res) => {
    console.log(req.body);

    const { scheduleID, volunteerID, date } = req.body;
    const parsedDate = new Date(date);
    const startOfDay = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate(), 23, 59, 59));
    try {
        // Check if the date falls within the event date range
        const volunteerSchedule = await VolunteerSchedule.findOne({
            ScheduleID: scheduleID,
            VolunteerID: volunteerID
        });

        if (!volunteerSchedule) {
            return res.status(404).send('Volunteer schedule not found');
        }

        // Check if the date falls within the event date range
        const { ScheduleID } = volunteerSchedule;
        const schedule = await scheduleDB.findById(ScheduleID).populate('EventID');
        if (!schedule) {
            return res.status(404).send('Schedule not found');
        }

        const { EventID } = schedule;
        const { StartDate, EndDate } = EventID;

        if (parsedDate < StartDate || parsedDate > EndDate) {
            return res.status(400).send('Attendance date is not within the event date range.');
        }

        // Find the attendance record for the given date
        let attendance = await Attendance.findOne({
            VolunteerScheduleID: volunteerSchedule._id,
            Date: startOfDay
        });

        // If attendance record exists, toggle check-out time
        if (attendance) {
            attendance.CheckOut = attendance.CheckOut ? null : new Date();
        } else {
            // If attendance record does not exist, create a new one with check-in time
            attendance = new Attendance({
                VolunteerScheduleID: volunteerSchedule._id,
                Date: startOfDay,
                CheckIn: new Date()
            });
        }

        // Save the updated or new attendance record
        await attendance.save();
        await volunteerSchedule.save();

        res.status(201).json('Attendance Updated');
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});

module.exports = router;