const express = require('express');
const router = express.Router();
const jwtVerify = require('./middleware/jwtVerify');
const mongoose = require('mongoose');
const scheduleDB = require('./models/scheduleModel');
const eventDB = require('./models/eventModel');
const volunteerScheduleDB = require('./models/volunteerScheduleModel');

router.get("/:organizationID", jwtVerify([0]), async (req, res) => {
    try {
        const organizationID = req.params.organizationID;
        const totalEvents = await eventDB.countDocuments({ OrganizationID: organizationID });

        const joinedEventsAggregate = await volunteerScheduleDB.aggregate([
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'ScheduleID',
                    foreignField: '_id',
                    as: 'schedule'
                }
            },
            {
                $unwind: '$schedule'
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'schedule.EventID',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            {
                $unwind: '$event'
            },
            {
                $match: {
                    'event.OrganizationID': new mongoose.Types.ObjectId(organizationID)
                }
            },
            {
                $count: 'totalJoinedEvents'
            }
        ]);

        const joinedVolunteersPerEventAggregate = await volunteerScheduleDB.aggregate([
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'ScheduleID',
                    foreignField: '_id',
                    as: 'schedule'
                }
            },
            {
                $unwind: '$schedule'
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'schedule.EventID',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            {
                $unwind: '$event'
            },
            {
                $match: {
                    'event.OrganizationID': new mongoose.Types.ObjectId(organizationID)
                }
            },
            {
                $group: {
                    _id: '$schedule.EventID',
                    eventName: { $first: '$event.Name' },
                    totalJoinedVolunteers: { $sum: 1 }
                }
            }
        ]);
    
        res.status(201).json({
            totalEvents: totalEvents,
            totalJoinedEvents: joinedEventsAggregate.length > 0 ? joinedEventsAggregate[0].totalJoinedEvents : 0,
            totalJoinedVolunteersPerEvent: joinedVolunteersPerEventAggregate
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

module.exports = router;