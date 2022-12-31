const User = require('../model/User');
const Room = require('../model/Room');
const Student = require('../model/StudentGroup')
const Reserv = require('../model/Reservation');
const moment = require('moment');

const getAllReserv = async (req, res) => {
    const reserv = await Reserv.find();
    if (!reserv) return res.status(204).json({ 'message': 'No reserv found.' });
    res.json(reserv);
}

const deleteReserv = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'reserv ID required.' });

    const reserv = await Reserv.findOne({ _id: req.body.id }).exec();
    if (!reserv) {
        return res.status(204).json({ "message": `No reserv matches ID ${req.body.id}.` });
    }
    const result = await reserv.deleteOne(); //{ _id: req.body.id }
    res.json(result);
}

const getReserv = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'Reserv ID required.' });

    const reserv = await Reserv.findOne({ _id: req.params.id }).exec();
    if (!reserv) {
        return res.status(204).json({ "message": `No reserv matches ID ${req.params.id}.` });
    }
    res.json(reserv);
}

const createNewReservation = async (req,res) => {
    // if (!req?.params?.id) return res.status(400).json({ 'message': 'Reserv ID required.' });

    // const reserv = await Reserv.findOne({ _id: req.params.id }).exec();
    // if (!reserv) {
    //     return res.status(204).json({ "message": `No reserv matches ID ${req.params.id}.` });
    // }

    const { datestart, dateend, room, studentgroup, user, userReserv } = req.body;
    if (!datestart || !dateend || !room || !studentgroup || !user) return res.status(400).json({ 'message': 'All params are required.' });


    // zapisuje w strefie czasowej angielskiej
     var startDate = new Date(datestart).toISOString();
     var endDate = new Date(dateend).toISOString();

    console.log(startDate)

    const isRoomReserved = await Reserv.find({ room: req.body.room,
        $or:[
        {datestart: {
            $gte:  startDate,
            $lte:  endDate
        }},
        {dateend: {
            $gte:  startDate,
            $lte:  endDate
        }}]
    }).exec();

    if(isRoomReserved.length > 0) console.log(isRoomReserved)

    const isStudentReserved = await Reserv.find({ studentgroup: req.body.studentgroup,
        $or:[
        {datestart: {
            $gte:  startDate,
            $lte:  endDate
        }},
        {dateend: {
            $gte:  startDate,
            $lte:  endDate
        }}]
    }).exec();

    if(isStudentReserved.length > 0) console.log(isRoomReserved)

    try {
        const result = await Reserv.create({
            "datestart": datestart,
            "dateend": dateend,
            "room": room,
            "studentgroup": studentgroup,
            "user": user,
            "userreserv": userReserv
        });
        result.save().then((result) => {
            Room.findOne({ _id: room }, (err, roomcheck) => {
                if (roomcheck) {
                    // The below two lines will add the newly saved review's 
                    // ObjectID to the the User's reviews array field
                    roomcheck.reservation.push(result.id);
                    roomcheck.save();
                }
            }),
            Student.findOne({ _id: studentgroup }, (err, studentgr) => {
                if (studentgr) {
                    // The below two lines will add the newly saved review's 
                    // ObjectID to the the User's reviews array field
                    studentgr.reservation.push(result.id);
                    studentgr.save();
                }
            }),
            User.findOne({ _id: user }, (err, userdata) => {
                if (userdata) {
                    // The below two lines will add the newly saved review's 
                    // ObjectID to the the User's reviews array field
                    userdata.reservation.push(result.id);
                    userdata.save();
                }
            }),
            User.findOne({ _id: userReserv }, (err, userdata) => {
                if (userdata) {
                    // The below two lines will add the newly saved review's 
                    // ObjectID to the the User's reviews array field
                    userdata.reservation.push(user.id);
                    userdata.save();
                }
            });
          });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

const updateReservation = async (req,res) => {

}

module.exports = {
    getAllReserv,
    deleteReserv,
    getReserv,
    createNewReservation,
    updateReservation
}