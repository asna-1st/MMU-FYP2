const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const Volunteer = require('./models/volunteerModel');
const Organization = require('./models/organizationModel');

router.post("/signup", [
    body('userType').isIn(['volunteer', 'organization']).withMessage('Invalid user type'),
    body('email').isEmail().withMessage('Invalid email address')
        .custom(async (value, { req }) => {
            const existingVolunteer = await Volunteer.findOne({ Email: value });
            const existingOrganization = await Organization.findOne({ Email: value });
            if (existingVolunteer || existingOrganization) {
                throw new Error('Email already exists');
            }
        }),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('country').notEmpty().withMessage('Country is required'),
    // Additional validation for organization-specific fields
    body('yearEstablished').if(body('userType').equals('organization')).isNumeric().withMessage('Year established must be a number'),
    body('address').if(body('userType').equals('organization')).notEmpty().withMessage('Address is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userType, fullName, email, password, country, yearEstablished, address } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        if (userType === 'volunteer') {
            const newVolunteer = new Volunteer({
                Name: fullName,
                Email: email,
                Password: hashedPassword,
                Country: country
            });
            await newVolunteer.save();
            res.status(201).json({ message: 'Volunteer registered successfully' });
        } else if (userType === 'organization') {
            const newOrganization = new Organization({
                Name: fullName,
                Email: email,
                YearEstablished: yearEstablished,
                Password: hashedPassword,
                Address: address,
                Country: country
            });
            await newOrganization.save();
            res.status(201).json({ message: 'Organization registered successfully' });
        } else {
            res.status(400).json({ error: 'Invalid user type' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;