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

router.get("/list", jwtVerify([0]), async (req, res) => {
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
});

module.exports = router;