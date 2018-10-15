var Payment = require('../models/payment_method');
// var bankAccounts = require('../models/provider');
var jwt = require('jsonwebtoken');
var { secret } = require('../config/index');
var ImageSaver = require('image-saver-nodejs/lib');
var multer = require('multer');

var addPayment = function(req, res) {
    var payment = new Payment();
    payment.code = req.body.code;
    payment.chanel = req.body.chanel;
    payment.type = req.body.type;
    payment.price = req.body.price;
    if (req.body.code == '' || req.body.code == null || req.body.chanel == '' || req.body.chanel == null || req.body.price == '' || req.body.price == null) {
        res.json({ success: false, message: 'Ensure All of Validation' });
    } else {
        payment.save(function(err) {
            if (err) { res.json({ success: false, message: 'gagal daftar payment' }); } else {
                res.json({ success: true, message: 'success daftar' });
            }
        })
    }

}



module.exports = {
    addPayment: addPayment
}