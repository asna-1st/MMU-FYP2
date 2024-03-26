const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    Name: String,
    Email: String,
    YearEstablished: Number,
    Password: String,
    Address: String,
    Country: String,
})

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;