const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    capacity: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
})

module.exports = mongoose.model('Room', roomSchema);