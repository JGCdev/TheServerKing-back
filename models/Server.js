// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let serverSchema = new Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
}, {
    collection: 'servers'
})

serverSchema.plugin(uniqueValidator, { message: 'Email already in use.' });
module.exports = mongoose.model('Server', serverSchema)