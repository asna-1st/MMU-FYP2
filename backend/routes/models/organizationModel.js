const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    Name: String,
    Email: String,
    YearEstablished: Number,
    Password: String,
    Address: String,
    Country: String,
})

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;