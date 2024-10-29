const User = require('../model/User');
const Room = require('../model/Room');
const Reserv = require('../model/Reservation');
const Student = require('../model/StudentGroup')

const getAllRooms = async (req, res) => {
    const rooms = await Room.find();
    if (!rooms) return res.status(204).json({ 'message': 'No rooms found.' });
    res.json(rooms);
}

const createNewRoom = async (req, res) => {
    if (!req?.body?.capacity || !req?.body?.type || !req?.body?.name) {
        return res.status(400).json({ 'message': 'Capacity and type are required' });
    }

    try {
        const result = await Room.create({
            name: req.body.name,
            capacity: req.body.capacity,
            type: req.body.type
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

const updateRoom = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const room = await Room.findOne({ _id: req.body.id }).exec();
    if (!room) {
        return res.status(204).json({ "message": `No room matches ID ${req.body.id}.` });
    }
    if (req.body?.capacity) room.capacity = req.body.capacity;
    if (req.body?.type) room.type = req.body.type;
    if (req.body?.name) room.name = req.body.name;
    const result = await room.save();
    res.json(result);
}

const deleteRoom = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Room ID required.' });

    const room = await Room.findOne({ _id: req.body.id }).exec();
    if (!room) {
        return res.status(204).json({ "message": `No room matches ID ${req.body.id}.` });
    }
    
    const arr = await Reserv.find({room: req.body.id}, '_id user studentgroup userReserv');
    console.log(arr);

    const result = await room.deleteOne().then((result) => {
        Reserv.deleteMany({ room: result._id }).then((result) => {

                    });
            }
        );

        var normalid = arr.map(({ _id }) => _id);

        var userid = arr.map(({ user }) => user);

        var studentid = arr.map(({ studentgroup }) => studentgroup);

        var ruser = arr.map(({ userreserv }) => userreserv);

       const rrr = await User.updateMany( {_id: { $in: userid }}, { $pullAll: {reservation: normalid } } );
        await Student.updateMany( {_id: studentid}, { $pullAll: {reservation: normalid } } );
        await User.updateMany( {_id: ruser}, { $pullAll: {reservation: normalid } } );


    res.json(result);
}

const getRoom = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'Employee ID required.' });

    const room = await Room.findOne({ _id: req.params.id }).exec();
    if (!room) {
        return res.status(204).json({ "message": `No employee matches ID ${req.params.id}.` });
    }
    res.json(room);
}

module.exports = {
    getAllRooms,
    createNewRoom,
    updateRoom,
    deleteRoom,
    getRoom
}