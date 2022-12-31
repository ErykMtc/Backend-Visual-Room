const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentGroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reservation: [{
        type: Schema.Types.ObjectId,
        ref: "Reservation"
    }]
})

module.exports = mongoose.model('StudentGroup', studentGroupSchema);