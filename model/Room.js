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
    reservation: [{
        type: Schema.Types.ObjectId,
        ref: "Reservation"
    }]
})

module.exports = mongoose.model('Room', roomSchema);