const User = require('../model/User');
const Room = require('../model/Room');
const Student = require('../model/StudentGroup')
const Reserv = require('../model/Reservation');
const moment = require('moment');

const getAllReserv = async (req, res) => {
    const reserv = await Reserv.find().populate('room', 'capacity type name')
    .populate('studentgroup', 'name year amount')
    .populate('user', 'firstname lastname')
    .populate('userreserv', 'firstname lastname').exec();
    if (!reserv) return res.status(204).json({ 'message': 'No reserv found.' });
    res.json(reserv);
}



const deleteReserv = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'reserv ID required.' });

    const reserv = await Reserv.findOne({ _id: req.body.id }).exec();

    if (!reserv) {
        return res.status(204).json({ "message": `No reserv matches ID ${req.body.id}.` });
    }

    const result = await reserv.deleteOne().then((result) => {
        Room.findOne({ _id: result.room }, (err, roomcheck) => {
            if (roomcheck) {
                // The below two lines will add the newly saved review's 
                // ObjectID to the the User's reviews array field
                roomcheck.reservation.pull(result.id);
                roomcheck.save();
            }
        }),
            Student.findOne({ _id: result.studentgroup }, (err, studentgr) => {
                if (studentgr) {
                    // The below two lines will add the newly saved review's 
                    // ObjectID to the the User's reviews array field
                    studentgr.reservation.pull(result.id);
                    studentgr.save();
                }
            }),
            User.findOne({ _id: result.user }, (err, userdata) => {
                if (userdata) {
                    // The below two lines will add the newly saved review's 
                    // ObjectID to the the User's reviews array field
                    userdata.reservation.pull(result.id);
                    userdata.save();
                }
            }),
            User.findOne({ _id: result.userreserv }, (err, userdata) => {
                if (userdata) {
                    // The below two lines will add the newly saved review's 
                    // ObjectID to the the User's reviews array field
                    userdata.reservation.pull(result.id);
                    userdata.save();
                }
            })
    });
    res.json(result);
}

const getReserv = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'Reserv ID required.' });

    const reserv = await Reserv.findOne({ _id: req.params.id })
        .populate('room', 'capacity type name')
        .populate('studentgroup', 'name year amount')
        .populate('user', 'firstname lastname')
        .populate('userreserv', 'firstname lastname').exec();

    if (!reserv) {
        return res.status(204).json({ "message": `No reserv matches ID ${req.params.id}.` });
    }
    res.json(reserv);
}

const createNewReservation = async (req, res) => {
    const { datestart, dateend, room, studentgroup, user, userReserv } = req.body;
    if (!datestart || !dateend || !room || !studentgroup || !user) return res.status(400).json({ 'message': 'All params are required.' });


    // zapisuje w strefie czasowej angielskiej
    var startDate = new Date(datestart).toISOString();
    var endDate = new Date(dateend).toISOString();

    console.log(startDate);


    const isUserFreeTime = await Reserv.find({
        user: req.body.user,
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }
        ]
    }).exec();


    if (isUserFreeTime.length > 0) return res.sendStatus(409); //Conflict



    const isRoomReserved = await Reserv.find({
        room: req.body.room,
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }]
    }).exec();

    if (isRoomReserved.length > 0) return res.sendStatus(409); //Conflict

    const isStudentReserved = await Reserv.find({
        studentgroup: req.body.studentgroup,
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }]
    }).exec();

    if (isStudentReserved.length > 0) return res.sendStatus(409); //Conflict




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
                        userdata.reservation.push(result.id);
                        userdata.save();
                    }
                });
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

const updateReservation = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const reserv = await Reserv.findOne({ _id: req.body.id }).exec();
    if (!reserv) {
        return res.status(204).json({ "message": `No reserv matches ID ${req.body.id}.` });
    }

    var startDate;
    var endDate;

    if (req.body?.datestart && req.body?.dateend) {
        // zapisuje w strefie czasowej angielskiej
        startDate = new Date(req.body.datestart).toISOString();
        endDate = new Date(req.body.dateend).toISOString();
    }else if (req.body?.datestart && !req.body?.dateend) {
        // zapisuje w strefie czasowej angielskiej
        startDate = new Date(req.body.datestart).toISOString();
        endDate = new Date(reserv.dateend).toISOString();
    }else if (!req.body?.datestart && req.body?.dateend) {
        // zapisuje w strefie czasowej angielskiej
        startDate = new Date(reserv.datestart).toISOString();
        endDate = new Date(req.body.dateend).toISOString();
    }
    
    console.log("aaaa", startDate , endDate);


    const isUserFreeTime = await Reserv.find({
        user: reserv.user,
        _id: { $ne: req.body.id },
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }]
    }).exec();

    console.log(isUserFreeTime)
    if (isUserFreeTime.length > 0) return res.sendStatus(409); //Conflict

    const isRoomReserved = await Reserv.find({
        room: reserv.room,
        _id: { $ne: req.body.id },
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }]
    }).exec();

    if (isRoomReserved.length > 0) return res.sendStatus(409); //Conflict

    const isStudentReserved = await Reserv.find({
        studentgroup: reserv.studentgroup,
        _id: { $ne: req.body.id },
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }]
    }).exec();

    if (isStudentReserved.length > 0) return res.sendStatus(409); //Conflict



    if (req.body?.datestart) reserv.datestart = req.body.datestart;
    if (req.body?.dateend) reserv.dateend = req.body.dateend;


    const result = await reserv.save();
    res.json(result);
}

const getUserReserv = async (req, res) => {
    if (!req?.params?.id || req.params.id === "undefined") return res.status(400).json({ 'message': 'reserv ID required.' });

    const reserv = await Reserv.find({ user: req.params.id })
    .populate('room', 'capacity type name')
    .populate('studentgroup', 'name year amount')
    .populate('user', 'firstname lastname')
    .populate('userreserv', 'firstname lastname').exec(); 
    if (!reserv) {
        return res.status(204).json({ "message": `No reserv matches ID ${req.params.id}.` });
    }
    res.json(reserv);
}

const verifyReserv = async (req, res) => {

    const { datestart, dateend, room, studentgroup, user, count, type, userReserv } = req.body;
    if (!datestart || !dateend || !room || !studentgroup || !user || !count || !type) return res.status(400).json({ 'message': 'All params are required.' });


    // zapisuje w strefie czasowej angielskiej
    var startDate = new Date(datestart).toISOString();
    var endDate = new Date(dateend).toISOString();

    for (let i = 0; i < count; i++) {

    const isUserFreeTime = await Reserv.find({
        user: req.body.user,
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }]
    }).exec();


    if (isUserFreeTime.length > 0) return res.sendStatus(409); //Conflict



    const isRoomReserved = await Reserv.find({
        room: req.body.room,
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }]
    }).exec();

    if (isRoomReserved.length > 0) return res.sendStatus(409); //Conflict

    const isStudentReserved = await Reserv.find({
        studentgroup: req.body.studentgroup,
        $or: [
            {
                datestart: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                dateend: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                $and:[
                    {
                        datestart: {
                            $lte: startDate
                        }
                    },
                    {
                        dateend: {
                            $gte: endDate
                        }
                    }
                ]
            }]
    }).exec();

    if (isStudentReserved.length > 0) return res.sendStatus(409); //Conflict
    
    startDate = moment(startDate).add(type, "days").format("YYYY-MM-DDTHH:mm");
    endDate = moment(endDate).add(type, "days").format("YYYY-MM-DDTHH:mm");
}

    startDate = new Date(datestart).toISOString();
    endDate = new Date(dateend).toISOString();

    for (let i = 0; i < count; i++) {
    try {
        const result = await Reserv.create({
            "datestart": startDate,
            "dateend": endDate,
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
                        userdata.reservation.push(result.id);
                        userdata.save();
                    }
                });
        });
        startDate = moment(startDate).add(type, "days").format("YYYY-MM-DDTHH:mm");
        endDate = moment(endDate).add(type, "days").format("YYYY-MM-DDTHH:mm");
        
    } catch (err) {
        console.error(err);
    }
}
res.status(201).json();
}

module.exports = {
    getAllReserv,
    deleteReserv,
    getReserv,
    createNewReservation,
    updateReservation,
    getUserReserv,
    verifyReserv
}