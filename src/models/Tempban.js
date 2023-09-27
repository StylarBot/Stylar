const { model, Schema } = require('mongoose');

module.exports = model('tempban', new Schema({
    Guild: String,
    User: String,
    Reason: String,
    Moderator: String,
    DateGivenMS: String,
    DateExpiresMS: String,
}));