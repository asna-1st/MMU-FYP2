const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    Name: String,
    Email: String,
    Password: String,
    Country: String,
})

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;