// var User = require('../models/user');
// var jwt = require('jsonwebtoken');
// var { secret }  = require('../config/index');
// var nodemailer = require('nodemailer');
// var sgTransport = require('nodemailer-sendgrid-transport');
var express         = require('express');
var userController  = require('../controllers/userController');
var userRouter      = express.Router();


userRouter.route('/users')
    .post(userController.register); 

userRouter.route('/checkemail')
    .post(userController.checkEmail);  

userRouter.route('/authenticate')
    .post(userController.authenticate);  

userRouter.route('/activate/:token')
    .put(userController.activate);  

userRouter.route('/forgot_password')
    .put(userController.forgot);  

userRouter.route('/forgot_password/:token')
    .get(userController.getForgotPassword);  

userRouter.route('/save_password')
    .put(userController.save);  

module.exports = userRouter;