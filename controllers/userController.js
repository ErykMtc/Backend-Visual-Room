const User = require('../model/User');
const Room = require('../model/Room');
const Student = require('../model/StudentGroup')

const getAllUsers = async (req, res) => {
    const users = await User.find({reservation: { $exists: true, $not: {$size: 0} }});
    if (!users) return res.status(204).json({ 'message': 'No users found.' });
    res.json(users);
}

const deleteUser = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'user ID required.' });

    const user = await USER.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res.status(204).json({ "message": `No user matches ID ${req.body.id}.` });
    }
    const result = await user.deleteOne(); //{ _id: req.body.id }
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

const handleNewReservation = async (req,res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'User ID required.' });

    const user = await User.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res.status(204).json({ "message": `No user matches ID ${req.params.id}.` });
    }

    const { datestart, dateend, room, studentgroup } = req.body;
    if (!datestart || !dateend || !room || !studentgroup) return res.status(400).json({ 'message': 'All params are required.' });
    
    const resv = {
        "datestart": datestart,
        "dateend": dateend,
        "room": room,
        "studentgroup": studentgroup
    };

    user.reservation.push(resv);

    const result = await user.save().then((result) => {
        Room.findOne({ _id: room }, (err, roomcheck) => {
            if (roomcheck) {
                // The below two lines will add the newly saved review's 
                // ObjectID to the the User's reviews array field
                roomcheck.users.push(user.id);
                roomcheck.save();
            }
        }),
        Student.findOne({ _id: studentgroup }, (err, studentgr) => {
            if (studentgr) {
                // The below two lines will add the newly saved review's 
                // ObjectID to the the User's reviews array field
                studentgr.users.push(user.id);
                studentgr.save();
            }
        });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });


    res.json(result);

    // _id: 'your_id'}, 
    //                 {$push: {'your_array_field': 
    //                 {"name": "foo","idAccount": 123456}}}, 
    //                 {new: true}, (err, result) => {
    //                 // Rest of the action goes here
    //                }
}

const deleteReservation = async (req,res) => {

}

const updateReservation = async (req,res) => {

}

module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    getAllReservUser,
    handleNewReservation
}