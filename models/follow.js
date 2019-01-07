const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let followSchema = Schema({
    user: {type: Schema.ObjetId, ref: 'User'},
    follow: {type: Schema.ObjetId, ref: 'User'}
});

module.exports = mongoose.model('Follow', followSchema);