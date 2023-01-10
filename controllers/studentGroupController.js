const User = require('../model/User');
const Room = require('../model/Room');
const Reserv = require('../model/Reservation');
const Student = require('../model/StudentGroup')

const getAllStudents = async (req, res) => {
    const students = await Student.find();
    if (!students) return res.status(204).json({ 'message': 'No students found.' });
    res.json(students);
}

const createNewStudent = async (req, res) => {
    if (!req?.body?.name || !req?.body?.year || !req?.body?.amount) {
        return res.status(400).json({ 'message': 'name, year, amount are required' });
    }

    try {
        const result = await Student.create({
            name: req.body.name,
            year: req.body.year,
            amount: req.body.amount
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

const updateStudent = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const student = await Student.findOne({ _id: req.body.id }).exec();
    if (!student) {
        return res.status(204).json({ "message": `No student matches ID ${req.body.id}.` });
    }
    if (req.body?.name) student.name = req.body.name;
    if (req.body?.year) student.year = req.body.year;
    if (req.body?.amount) student.amount = req.body.amount;
    const result = await student.save();
    res.json(result);
}

const deleteStudent = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Student ID required.' });

    const student = await Student.findOne({ _id: req.body.id }).exec();
    if (!student) {
        return res.status(204).json({ "message": `No student matches ID ${req.body.id}.` });
    }

    const arr = await Reserv.find({studentgroup: req.body.id}, '_id room user userReserv');
    console.log(arr);

    const result = await student.deleteOne().then((result) => {
        Reserv.deleteMany({ studentgroup: result._id }).then((result) => {
                    // console.log(result);
                    // console.log(result._id)
                    });
            }
        );

        var normalid = arr.map(({ _id }) => _id);

        var roomid = arr.map(({ room }) => room);

        var userid = arr.map(({ user }) => user);

        var ruser = arr.map(({ userreserv }) => userreserv);

       const rrr = await Room.updateMany( {_id: { $in: roomid }}, { $pullAll: {reservation: normalid } } );
        await User.updateMany( {_id: userid}, { $pullAll: {reservation: normalid } } );
        await User.updateMany( {_id: ruser}, { $pullAll: {reservation: normalid } } );

        // console.log("aaa", rrr);

    res.json(result);
}

const getStudent = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'Student ID required.' });

    const student = await Student.findOne({ _id: req.params.id }).exec();
    if (!student) {
        return res.status(204).json({ "message": `No student matches ID ${req.params.id}.` });
    }
    res.json(student);
}

module.exports = {
    getAllStudents,
    createNewStudent,
    updateStudent,
    deleteStudent,
    getStudent
}