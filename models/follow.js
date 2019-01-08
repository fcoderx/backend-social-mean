const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let followSchema = Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    followed: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Follow', followSchema);