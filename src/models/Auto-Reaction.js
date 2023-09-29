const { model, Schema } = require('mongoose');

module.exports = model('autoreaction', new Schema({
    Guild: String,
    Channel: String,
    Emojis: Array,
}))