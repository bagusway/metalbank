var express = require('express');
var userAccessController = require('../controllers/userAccessController');
var userAccessRouter = express.Router();

userAccessRouter.route('/profile')
    .get(userAccessController.getProfile);

userAccessRouter.route('/profile')
    .put(userAccessController.editProfile);

userAccessRouter.route('/edit_photo_profile')
    .put(userAccessController.editPhotoProfile);

userAccessRouter.route('/change_password')
    .post(userAccessController.modifyPassword);

userAccessRouter.route('/register_provider')
    .post(userAccessController.registerProvider);

userAccessRouter.route('/billing')
    .post(userAccessController.billing);

userAccessRouter.route('/addPromo')
    .post(userAccessController.addpromo);

userAccessRouter.route('/deletepromo/:id_promo')
    .post(userAccessController.deletepromo);

userAccessRouter.route('/review/:id_booking')
    .post(userAccessController.postReview);

userAccessRouter.route('/bookinguser')
    .get(userAccessController.getBookingUser);

userAccessRouter.route('/booking_detail/:id')
    .get(userAccessController.getBookingDetailbyId);

userAccessRouter.route('/logout')
    .get(userAccessController.userLogout);

module.exports = userAccessRouter;