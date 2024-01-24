const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email : { type: String, unique: true, required: true},
    fullName : { type: String, required:true },
    password: { type: String, required:true },
    address: String,
    country: String,
    state: String,
    postcode: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;