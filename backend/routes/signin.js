const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/userModel');
const orgUser = require('./models/organizationModel');
const volUser = require('./models/volunteerModel');
require('dotenv').config();


router.post("/signin", [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async(req, res) => {
    try {
        console.log(req.body);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, userType } = req.body;

        let user;
        if (userType == 0) {
            user = await orgUser.findOne({Email: email});
            console.log(email);
        } else if (userType == 1) {
            user = await volUser.findOne({Email: email});
        }

        console.log(user);
        if(!user){
            return res.status(401).json({error: 'Invalid credentials'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return res.status(401).json({error: 'Invalid credentials'});
        }

        const token = jwt.sign({userID: user._id, userType: userType}, process.env.JWT_SECRETKEY, {expiresIn: '7d'});

        res.status(200).json({token});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;