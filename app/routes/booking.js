var express = require('express');
var bookingController = require('../controllers/bookingController');
var bookingRouter = express.Router();

bookingRouter.route('/add')
    .post(bookingController.addBooking);

bookingRouter.route('/add_detail')
    .put(bookingController.postDetailbooking);

bookingRouter.route('/add_payment')
    .put(bookingController.addPaymentbooking);

bookingRouter.route('/update_status')
    .put(bookingController.updateStatuspayment);

bookingRouter.route('/add_traveller_detail')
    .put(bookingController.addTravellerdetail);

bookingRouter.route('/eticket/:_id')
    .get(bookingController.geteTicketTraveller);

bookingRouter.route('/booking_confirmation_mepo')
    .put(bookingController.confirmationBookMepo);

bookingRouter.route('/booking_user')
    .get(bookingController.getBookinguser);

bookingRouter.route('/detail/:id_booking')
    .get(bookingController.getDetailBooking);

bookingRouter.route('/history')
    .get(bookingController.getHistorybooking);

module.exports = bookingRouter;