const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(userController.getAllUsers)
    .delete(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), userController.deleteUser);

router.route('/search/:id')
    .get(userController.getUser);

router.route('/reserv')
    .get(userController.getAllReservUser);


module.exports = router;