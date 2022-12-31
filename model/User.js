const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    roles: {
        User: {
            type: Number,
            default: 2001
        },
        Editor: Number,
        Admin: Number
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: String,
    firstname: {
        type: String,
        // required: true
    },
    lastname: {
        type: String,
        // required: true
    },
    email: {
        type: String
    },
    telephone: {
        type: Number
    },
    reservation: [{
        reservid: {
            type: Schema.Types.ObjectId,
            ref: "Reservation"
        }    
    }]

});

module.exports = mongoose.model('User', userSchema);