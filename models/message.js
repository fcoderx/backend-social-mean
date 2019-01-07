const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let messageSchema = Schema({
    text: String,
    created_at: String,
    emitter: {type: Schema.ObjetId, ref: 'User'},
    receiver: {type: Schema.ObjetId, ref: 'User'}
});

module.exports = mongoose.model('Message', messageSchema);