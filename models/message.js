const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let messageSchema = Schema({
    text: String,
    created_at: String,
    emitter: {type: Schema.Types.ObjectId, ref: 'User'},
    receiver: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Message', messageSchema);