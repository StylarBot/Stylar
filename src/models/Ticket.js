const { model, Schema } = require('mongoose');

module.exports = model('tickets', new Schema({
    Guild: String,
    User: String,
    Channel: String,
    Contributors: Array,
    Transcript: Array,
    Active: Boolean,
    AllUsers: Array,
}))