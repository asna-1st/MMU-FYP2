const express = require('express');
const router = express.Router();
const jwtVerify = require('./middleware/jwtVerify');

const volUser = require('./models/volunteerModel');
const orgUser = require('./models/organizationModel');
const { Error } = require('mongoose');

router.post("/detail", jwtVerify([0, 1]), async (req, res) => {
    try {
        console.log(req.body);

        const userID = res.locals.userID;

        console.log(userID)

        let user, userDetail, userType;
        if (res.locals.userType == 1) {
            user = await volUser.findById(userID);
            userType = 'Volunteer';
            userDetail = {
                _id: user._id,
                Name: user.Name,
                Email: user.Email,
                Country: user.Country,
                userType
            }
        } else if (res.locals.userType == 0) {
            user = await orgUser.findById(userID);
            userType = 'Organization';
            userDetail = {
                _id: user._id,
                Name: user.Name,
                Email: user.Email,
                Address: user.Address,
                Country: user.Country,
                userType
            }
        }

        
        res.status(200).json({ userDetail  });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});


router.post("/edit", jwtVerify([0, 1]), async (req, res) => {
    try {
        console.log(req.body);
        const { userName, email, country, address } = req.body;

        let userDetail;
        if (res.locals.userType == 1) {
            userDetail = await volUser.findByIdAndUpdate(res.locals.userID, {Name: userName, Email: email, Country: country});
        } else if (res.locals.userType == 0) {
            userDetail = await orgUser.findByIdAndUpdate(res.locals.userID, {Name: userName, Email: email, Address: address, Country: country});
        }
        res.status(201).json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.post("/delete", jwtVerify([0, 1]), async (req, res) => {
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

module.exports = router;