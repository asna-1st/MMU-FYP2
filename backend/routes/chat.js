const express = require('express');
const jwt = require('jsonwebtoken');
const zlib = require('zlib');
const Message = require('./models/chatModel');
const router = express.Router();

router.post("/history/:eventID", async (req, res) => {
    const { eventID } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    console.log(req.params)
    try {
        const history = await Message.find({eventID })
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec();
        console.log(history);
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ sucess: false, error: error.message });
    }
});

module.exports = router;