// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let serverSchema = new Schema({
    game: {
        type: String
    },
    servername: {
        type: String
    },
    description: {
        type: String
    },
    creationDate: {
        type: Date
    },
    refreshDate: {
        type: Date
    },
    country: {
        type: String
    },
    type: {
        type: String
    },
    author: {
        type: String
    },
    owner: {
        type: String
    },
    ip: {
        type: String
    },
    web: {
        type: String
    },
    youtube: {
        type: String
    },
    discord: {
        type: String
    },
    imgPath: {
        type: String
    },
    tags: {
        type: Array
    },
    pvp: {
        type: Boolean
    },
    race: {
        type: Boolean
    },
    rp: {
        type: Boolean
    },

}, {
    collection: 'servers'
})

module.exports = mongoose.model('Server', serverSchema)