const express = require('express');
const jwt = require('jsonwebtoken');
const zlib = require('zlib');
const router = express.Router();


const SECRET_KEY = '';

router.post("/generateQR", async(req, res) => {
    const {user_id, schedule_id} = req.body;

    const token = jwt.sign({user_id, schedule_id}, SECRET_KEY, {algorithm: 'HS256'});

    res.json(token)
});

module.exports = router;