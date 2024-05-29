const express = require('express');
const jwt = require('jsonwebtoken');
const zlib = require('zlib');
const jwtVerify = require('./middleware/jwtVerify');
const router = express.Router();


router.post("/generateQR", jwtVerify([1]),async(req, res) => {
    const { volScheduleID, beginDate, endDate} = req.body;

    const beginStartOfDay = new Date(beginDate);
    beginStartOfDay.setHours(0, 0, 0, 0);
    const beginTimestamp = Math.floor(beginStartOfDay.getTime() / 1000);

    const endEndOfDay = new Date(endDate);
    endEndOfDay.setHours(23, 59, 59, 999);
    const endTimestamp = Math.floor(endEndOfDay.getTime() / 1000);

    const payload = {
        volScheduleID: volScheduleID,
        nbf: beginTimestamp,
        exp: endTimestamp
    }

    console.log(payload);
    const token = jwt.sign(payload, "098dffdg9899", {algorithm: 'HS256'});
    console.log(req.body);
    res.json(token)
});

module.exports = router;