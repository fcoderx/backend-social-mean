const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let publicationSchema = Schema({
    text: String,
    file: String,
    create_at: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Publication', publicationSchema);