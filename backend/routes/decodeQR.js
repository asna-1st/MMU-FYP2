const express = require('express');
const jwt = require('jsonwebtoken');
const zlib = require('zlib');
const router = express.Router();


const SECRET_KEY = '';

router.post("/decodeQR", async(req, res) => {
    const { token } = req.body;
    //console.log(req.body);

    try {
        const decodedToken = jwt.verify(token, SECRET_KEY, {algorithms: 'HS256'});
        //console.log(decodedToken);
        res.json(decodedToken);
    } catch (error) {
        if (error instanceof jwt.ExpiredSignatureError) {
            res.status(401).json({ error: 'Token has expired. Please generate a new one.' });
        } else {
            res.status(400).json({ error: 'Invalid token' });
        }
    }
}); 

module.exports = router;