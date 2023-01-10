const User = require('../model/User');
const Room = require('../model/Room');
const Reserv = require('../model/Reservation');
const Student = require('../model/StudentGroup')

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if (!users) return res.status(204).json({ 'message': 'No users found.' });
    res.json(users);
}

const deleteUser = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'user ID required.' });

    const user = await User.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res.status(204).json({ "message": `No user matches ID ${req.body.id}.` });
    }

    const arr = await Reserv.find({user: req.body.id}, '_id room studentgroup userReserv');
    console.log(arr);

    const result = await user.deleteOne().then((result) => {
        Reserv.deleteMany({ user: result._id }).then((result) => {
                    // console.log(result);
                    // console.log(result._id)
                    });
            }
        );

        var normalid = arr.map(({ _id }) => _id);

        var roomid = arr.map(({ room }) => room);

        var studentid = arr.map(({ studentgroup }) => studentgroup);

        var ruser = arr.map(({ userreserv }) => userreserv);

       const rrr = await Room.updateMany( {_id: { $in: roomid }}, { $pullAll: {reservation: normalid } } );
        await Student.updateMany( {_id: studentid}, { $pullAll: {reservation: normalid } } );
        await User.updateMany( {_id: ruser}, { $pullAll: {reservation: normalid } } );

        // console.log("aaa", rrr);

    res.json(result);
}

const getUser = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'User ID required.' });

    const user = await User.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res.status(204).json({ "message": `No user matches ID ${req.params.id}.` });
    }
    res.json(user);
}

const getAllReservUser = async (req,res) => {
    const usersRes = await User.find({reservation: { $exists: true, $not: {$size: 0} }});
    if (!usersRes) return res.status(204).json({ 'message': 'No users found.' });
    res.json(usersRes);
}

const updateUserRole = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const user = await User.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res.status(204).json({ "message": `No user matches ID ${req.body.id}.` });
    }
    console.log(req.body.roles);
    if (req.body?.roles) user.roles = req.body.roles;

    const result = await user.save();
    res.json(result);
}

module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    getAllReservUser,
    updateUserRole
}