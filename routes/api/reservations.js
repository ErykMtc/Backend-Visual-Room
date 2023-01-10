const express = require('express');
const router = express.Router();
const reservController = require('../../controllers/reservationController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(reservController.getAllReserv)
    .post(reservController.createNewReservation)
    .put(reservController.updateReservation)
    .delete(reservController.deleteReserv);

router.route('/:id')
    .get(reservController.getReserv);

router.route('/user/:id')
    .get(reservController.getUserReserv);

router.route('/create')
    .post(reservController.verifyReserv);

module.exports = router; 