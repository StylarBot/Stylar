const { model, Schema } = require('mongoose');

module.exports = model('globalannouncements', new Schema({
    Guild: String,
    Channel: String,
}))