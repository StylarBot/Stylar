const { model, Schema } = require('mongoose');

module.exports = model('autoreply', new Schema({
    Guild: String,
    Phrase: String,
    Reply: String,
}))