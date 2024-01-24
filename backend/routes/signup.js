const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const User = require('./models/userModel');

router.post("/signup", [
    body('email').isEmail().withMessage('Invalid email address'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async(req, res) => {
    try {
        console.log(req.body);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, fullName, password, address, country, state, postcode } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
            address,
            country,
            state,
            postcode
        });

        await newUser.save();

        res.status(201).json({message: 'User registered succesfully'});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;