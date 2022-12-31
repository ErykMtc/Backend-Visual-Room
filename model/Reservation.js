const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservSchema = new Schema({

        datestart: {
            type: Date
        }, 
        dateend: {
            type: Date
        },
        room: {
            type: Schema.Types.ObjectId,
            ref: "Room"
        },
        studentgroup: {
            type: Schema.Types.ObjectId,
            ref: "StudentGroup"
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        userreserv: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
         

});

module.exports = mongoose.model('Reservation', reservSchema);