const express = require('express');
const router = express.Router();
const jwtVerify = require('./middleware/jwtVerify');
const scheduleDB = require('./models/scheduleModel');
const volunteerScheduleDB = require('./models/volunteerScheduleModel');
const attendanceDB = require('./models/attendance');
const { getIO } = require('../socketio/chatSocketIO');
const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');

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

// function startOfDay(date) {
//     const startOfDay = new Date(date);
//     startOfDay.setHours(0, 0, 0, 0);
//     return startOfDay;
// }

router.post("/", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);

        const { volScheduleToken } = req.body;
        let volScheduleID;

        const decoded = jwt.verify(volScheduleToken, process.env.JWT_SECRETKEY);

        console.log("Decoded token:", decoded);
        volScheduleID = decoded.volScheduleID;

        const currentDate = DateTime.local() // Auto-detect timezone

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

        const eventStartDate = DateTime.fromJSDate(StartDate);
        const eventEndDate = DateTime.fromJSDate(EndDate);

        if (currentDate <= eventStartDate || currentDate >= eventEndDate) {
            return res.status(400).json({ success: false, message: 'Attendance date is not within the event date range.' });
        }

        const startOfDay = (date) => date.startOf('day').toJSDate();
        let existingAttendance = await attendanceDB.findOne({ VolunteerScheduleID: volScheduleID, Date: startOfDay(currentDate) });

        if (!existingAttendance) {
            existingAttendance = new attendanceDB({
                VolunteerScheduleID: volScheduleID,
                Date: startOfDay(currentDate),
                CheckIn: currentDate.toJSDate()
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
                existingAttendance.CheckIn = currentDate.toJSDate();
                await existingAttendance.save();
                io.to(volScheduleID).emit('attendance', { volStatus: 'checked-in' });
                return res.status(201).json({ success: true, message: 'Successfully checked in.', volName: VolunteerID.Name, attStatus: "Check-In" });
            }
            // If check-out time is not set, update it
            if (!existingAttendance.CheckOut) {
                existingAttendance.CheckOut = currentDate.toJSDate();
                await existingAttendance.save();
                io.to(volScheduleID).emit('attendance', { volStatus: 'checked-out' });
                return res.status(201).json({ success: true, message: 'Successfully checked out.', volName: VolunteerID.Name, attStatus: "Check-Out" });
            }
        }
    } catch (err) {
        console.log(err);
        if (err instanceof jwt.NotBeforeError) {
            return res.status(400).json({ success: false, message: 'Attendance is not ready.' });
        } else if (err instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ success: false, message: 'Attendance cannot be used' });
        } else if (jwt.JsonWebTokenError) {
            return res.status(400).json({ success: false, message: 'Not valid QR Code' });
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

    const { scheduleID, date, timeZone } = req.body;
    
    const timeZoneToUse = timeZone || 'UTC';
    
    const parsedDate = DateTime.fromISO(date, { zone: timeZoneToUse });
    
    const startOfDay = parsedDate.startOf('day').toUTC();
    console.log(startOfDay)
    const endOfDay = parsedDate.endOf('day').toUTC();
    console.log(endOfDay)

    try {
        const volunteerSchedules = await volunteerScheduleDB.find({ ScheduleID: scheduleID }).populate('VolunteerID');

        const attendanceRecords = await attendanceDB.find({
            Date: {
                $gte: startOfDay.toJSDate(),
                $lte: endOfDay.toJSDate()
            }
        }).populate({
            path: 'VolunteerScheduleID',
            populate: {
                path: 'VolunteerID'
            }
        });

        const attendanceMap = new Map();
        attendanceRecords.forEach(record => {
            attendanceMap.set(record.VolunteerScheduleID._id.toString(), record);
        });

        const result = volunteerSchedules.map(volSchedule => ({
            VolunteerID: volSchedule.VolunteerID,
            Attendance: attendanceMap.has(volSchedule._id.toString())
                ? [attendanceMap.get(volSchedule._id.toString())]
                : []
        }));

        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});

router.post('/manual/toggle', jwtVerify([0]), async (req, res) => {
    console.log(req.body);

    const { scheduleID, volunteerID, date, timeZone } = req.body;

    if (!timeZone || typeof timeZone !== 'string') {
        return res.status(400).send('Invalid or missing time zone');
    }

    try {
        const parsedDate = new Date(date);
        const startOfDay = new Date(parsedDate.toLocaleString('en-US', { timeZone }));
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate.toLocaleString('en-US', { timeZone }));
        endOfDay.setUTCHours(23, 59, 59, 999);

        const volunteerSchedule = await volunteerScheduleDB.findOne({
            ScheduleID: scheduleID,
            VolunteerID: volunteerID
        });

        if (!volunteerSchedule) {
            return res.status(404).send('Volunteer schedule not found');
        }

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

        let attendance = await attendanceDB.findOne({
            VolunteerScheduleID: volunteerSchedule._id,
            Date: startOfDay
        });

        if (attendance) {
            attendance.CheckOut = attendance.CheckOut ? null : new Date();
        } else {
            attendance = new attendanceDB({
                VolunteerScheduleID: volunteerSchedule._id,
                Date: startOfDay,
                CheckIn: new Date()
            });
        }

        await attendance.save();
        await volunteerSchedule.save();

        res.status(201).json('Attendance Updated');
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});


router.post('/check', jwtVerify([1]), async (req, res) => {
    console.log(req.body)
    try {
        const { volScheduleID } = req.body;

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const attendances = await attendanceDB.findOne({
            VolunteerScheduleID: volScheduleID,
            Date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (!attendances) {
            return res.status(200).json({ checkedIn: false, checkedOut: false });
        }

        const checkedIn = !!attendances.CheckIn;
        const checkedOut = !!attendances.CheckOut;

        res.status(201).json({checkedIn, checkedOut});
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal Server Error' });;
    }
});

module.exports = router;