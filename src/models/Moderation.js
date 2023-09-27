const { model, Schema } = require('mongoose');

module.exports = model('moderation', new Schema({
    Guild: String,
    User: String,
    Reason: String,
    Punishment: String,
    DateTimeMS: String,
    Moderator: String,
}))