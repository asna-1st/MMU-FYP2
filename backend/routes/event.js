const express = require('express');
const router = express.Router();
const jwtVerify = require('./middleware/jwtVerify');

const eventDB = require('./models/eventModel');

router.post("/create", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);
        const { eventName, description, startDate, endDate, address, country } = req.body;

        const newEvent = new eventDB({
            Name: eventName,
            StartDate: startDate,
            EndDate: endDate,
            Description: description,
            Address: address,
            Country: country,
            OrganizationID: res.locals.userID
        });

        await newEvent.save();
        res.status(201).json({ success: true });
    } catch (error) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

/* router.get("/list", jwtVerify([0]), async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const events = await eventDB.find({ OrganizationID: res.locals.userID }).skip(skip).limit(limit);

        res.status(200).json({
            events
        });
    } catch (error) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
}); */

router.post("/list", jwtVerify([0]), async (req, res) => {
    try {
        const events = await eventDB.find({ OrganizationID: res.locals.userID });

        res.status(200).json({
            events
        });
    } catch (error) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/available", jwtVerify([1]), async (req, res) => {
    const currentDate = new Date();
    try {
        const events = await eventDB.find({
            StartDate: { $gte: currentDate }
        }).populate({
            path: 'OrganizationID',
            select: 'Name'
        });

        res.status(200).json({
            events
        });
    } catch (error) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post('/detail', jwtVerify([0, 1]), async (req, res) => {
    try {
        console.log(req.body);
        const {eventID} = req.body;

        const eventDetail = await eventDB.findById(eventID).populate('OrganizationID', 'Name');;
        console.log(eventDetail)
        res.status(200).json({eventDetail});
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/delete", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);
        const { eventID } = req.body;

        await eventDB.findByIdAndDelete(eventID)

        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/edit", jwtVerify([0]), async (req, res) => {
    try {
        console.log(req.body);
        const { eventID, eventName, description, startDate, endDate, address, country } = req.body;

        await eventDB.findByIdAndUpdate(eventID,
            {
                Name: eventName,
                Description: description,
                StartDate: startDate,
                EndDate: endDate,
                Address: address,
                Country: country
            });

        res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

module.exports = router;