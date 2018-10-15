var User = require('../models/user');
var Provider = require('../models/provider');
var jwt = require('jsonwebtoken');
var { secret } = require('../config/index');
var ImageSaver = require('image-saver-nodejs/lib');
var multer = require('multer');
var Booking = require('../models/booking');
var Billing = require('../models/billing');
var Promo = require('../models/promo');
var Review = require('../models/review');
var Trip = require('../models/trip');
var fs = require('fs');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

//Cek ROLE

/*
1 = user
2 = provider
3 = admin provider
4 = admin travinesia
5 = customer
*/


var options = {
    auth: {
        api_user: 'travinesia',
        api_key: 'travinesia123'
    }
}

var client = nodemailer.createTransport(sgTransport(options));

var getProfile = function(req, res) {
    User.findById({ _id: req.user_id }, 'name email telephone identity_number birthday photo', function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (err) {
                res.send({ status: 404, message: 'Not Found' });
            } else {
                res.send({ status: 200, message: 'Data successfully', data: user });
            }
        }
    });
}

var editProfile = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 1 || user.role == 2) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    user.birthday = req.body.birthday || user.birhtday;
                    user.gender = req.body.gender || user.gender;
                    user.email = req.body.email || user.email;
                    user.telephone = req.body.telephone || user.telephone;
                    user.identity_number = req.body.identity_number || user.identity_number;
                    // Save the updated document back to the database
                    user.save(function(err, user) {
                        if (err) {
                            res.status(500).send(err)
                        }
                        res.status(200).send(user);
                    });
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });

}

var editPhotoProfile = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            var imageSaver = new ImageSaver();
            user.photo = user.photo;
            var pictname = new Date().getTime();
            if (req.body.photo != null) {
                if (user.photo != null) {
                    var del_pict = user.photo.split('http://localhost/images/user/')[1];
                    fs.unlinkSync('C:/xampp/htdocs/images/user/' + del_pict);
                } else {
                    user.photo = "http://localhost/images/user/" + pictname + ".jpg";
                    imageSaver.saveFile("C:/xampp/htdocs/images/user/" + pictname + ".jpg", req.body.photo)
                        .then((data) => {
                            console.log("upload photo success");
                        })
                        .catch((err) => {
                            res.json({ status: 400, message: err });
                        })
                }
                user.photo = "http://localhost/images/user/" + pictname + ".jpg";
                imageSaver.saveFile("C:/xampp/htdocs/images/user/" + pictname + ".jpg", req.body.photo)
                    .then((data) => {
                        console.log("upload photo success");
                    })
                    .catch((err) => {
                        res.json({ status: 400, message: err });
                    })
            }
            user.save(function(err, user) {
                if (err) {
                    res.status(500).send(err)
                }
                res.status(200).send(user.photo);
            });
        }
    });
}

var modifyPassword = function(req, res, next) {
    User.findById(req.user_id).select('name email password role').exec(function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error: User Not Found' });
        } else {
            if (user.role == 1 || user.role == 2) {
                if (req.body.password) {
                    var changePassword = user.comparePassword(req.body.password);
                } else {
                    res.json({ status: 400, success: false, message: 'No password provided' });
                    //return next();
                }
                if (!changePassword) {
                    res.json({ status: 400, success: false, message: 'Wrong Old Password' });
                    //return next();
                } else {
                    var new_password = req.body.new_password;
                    if (!new_password) {
                        res.json({ status: 400, success: false, message: 'Please insert your new password!' });
                    } else {
                        user.password = new_password;
                        user.save(function(err, user) {
                            if (err) {
                                res.status(500).send(err)
                            } else {
                                res.send({ status: 200, message: 'Password has been changed!', data: user });
                            }
                        });
                    }
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user" });
            }
        }
    });
}

var registerProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 1 && user.flag_provider == false) {
                Provider.findOne({ 'id_user': req.id_user }, function(err, check_provider) {
                    if (err) {
                        res.status(500).send(err);
                    } else if (!check_provider) {
                        var provider = new Provider();
                        provider.id_user = req.id_user;
                        provider.travel_name = req.body.travel_name;
                        provider.slogan = req.body.slogan;
                        provider.description = req.body.description;
                        provider.office_address = req.body.office_address;
                        provider.province = req.body.province;
                        provider.office_phone_number = req.body.office_phone_number;
                        provider.domain = req.body.domain;
                        provider.medsoc_account = req.body.medsoc_account;
                        provider.logo = req.body.logo;
                        var imageSaver = new ImageSaver();
                        var pictname = new Date().getTime();
                        if (req.body.logo != null) {
                            provider.logo = "http://localhost/images/provider/" + pictname + ".jpg";
                            imageSaver.saveFile("C:/xampp/htdocs/images/provider/" + pictname + ".jpg", req.body.logo)
                                .then((data) => {
                                    console.log("upload photo success");
                                })
                                .catch((err) => {
                                    res.json({ status: 400, message: err });
                                })
                        }
                        if (req.body.travel_name == null || req.body.travel_name == '' || req.body.slogan == null || req.body.slogan == '' || req.body.description == null || req.body.description == '' || req.body.office_address == null || req.body.office_address == '' || req.body.province == null || req.body.province == '' || req.body.office_phone_number == null || req.body.office_phone_number == '' || req.body.domain == null || req.body.domain == '') {
                            // if(req.body == null || req.body == '') {
                            res.json({ status: 400, success: false, message: 'Make sure you fill out all the forms' });
                        } else {
                            provider.save(function(err, provider) {
                                if (err) {
                                    res.status(500).send(err)
                                } else {
                                    var email = {
                                        from: 'Travinesia, admin@travinesia.com',
                                        to: user.email,
                                        subject: 'Travinesia Provider Confirmation',
                                        text: 'Hello ' + user.name + ', Thankyou for registering to be provider. Please wait for admin confirmation to access Provider page',
                                        html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Thankyou for registering to be provider. Please wait for admin confirmation to access Provider page<br><br>'
                                    };

                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log('Message sent: ' + info.response);
                                        }
                                    });
                                    res.send({ status: 200, message: 'Provider registered and waiting for confirmation from admin!' });
                                }
                            })
                        }
                    } else if (user.id_user == check_provider.id_user) {
                        res.send({ status: 400, message: 'You are already registered as a provider just wait the confirmation!' });
                    }
                }); // Handle any possible database errors
            } else {
                res.send({ status: 400, message: 'You are already registered as a provider!' });
            }
            //return next();
        }
    });
}

var billing = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            Booking.findOne({ id_booking: req.body.id_booking }, function(err, booking) {
                if (req.body.id_booking != booking.id_booking) {
                    res.json({ status: 400, success: false, message: 'belom ada transaksi' });
                } else {
                    var billing = new Billing();
                    billing.id_user = req.id_user;
                    billing.id_billing = booking.id_billing;
                    billing.TRANSACTIONTYPE = req.body.TRANSACTIONTYPE;
                    billing.RESPONSE_TYPE = req.body.RESPONSE_TYPE;
                    billing.LANG = req.body.LANG;
                    billing.MERCHANTID = req.body.MERCHANTID;
                    billing.PAYMENT_METHOD = booking.id_paymentMethod;
                    billing.TXN_PASSWORD = req.body.TXN_PASSWORD;
                    billing.MERCHANT_TRANID = Date.now();
                    billing.CURRENCYCODE = req.body.CURRENCYCODE;
                    billing.AMOUNT = booking.coded_amount;
                    billing.CUSTNAME = user.name;
                    billing.CUSTEMAIL = user.email;
                    billing.DESCRIPT_ION = req.body.DESCRIPT_ION;
                    billing.RETURN_URL = req.body.RETURN_URL;
                    billing.SIGNATURE = req.body.SIGNATURE;
                    billing.BILLING_ADDRESS = req.body.BILLING_ADDRESS;
                    billing.BILLING_ADDRESS_CITY = req.body.BILLING_ADDRESS_REGION;
                    billing.BILLING_ADDRESS_REGION = req.body.BILLING_ADDRESS_REGION;
                    billing.BILLING_ADDRESS_STATE = req.body.BILLING_ADDRESS_STATE;
                    billing.BILLING_ADDRESS_POSCODE = req.body.BILLING_ADDRESS_POSCODE;
                    billing.BILLING_ADDRESS_COUNTRY_CODE = req.body.BILLING_ADDRESS_COUNTRY_CODE;
                    billing.RECEIVER_NAME_FOR_SHIPPING = req.body.RECEIVER_NAME_FOR_SHIPPING;
                    billing.SHIPPING_ADDRESS = req.body.SHIPPING_ADDRESS;
                    billing.SHIPPING_ADDRESS_CITY = req.body.SHIPPING_ADDRESS_CITY;
                    billing.SHIPPING_ADDRESS_REGION = req.body.SHIPPING_ADDRESS_REGION;
                    billing.SHIPPING_ADDRESS_STATE = req.body.SHIPPING_ADDRESS_STATE;
                    billing.SHIPPING_ADDRESS_POSCODE = req.body.SHIPPING_ADDRESS_POSCODE;
                    billing.SHIPPING_ADDRESS_COUNTRY_CODE = req.body.SHIPPING_ADDRESS_COUNTRY_CODE;
                    billing.SHIPPINGCOST = req.body.SHIPPINGCOST;
                    billing.PHONE_NO = user.telephone;
                    billing.MREF1 = req.body.MREF1;
                    billing.MREF2 = req.body.MREF2;
                    billing.MREF3 = req.body.MREF3;
                    billing.MREF4 = req.body.MREF4;
                    billing.MREF5 = req.body.MREF5;
                    billing.MREF6 = req.body.MREF6;
                    billing.MREF7 = req.body.MREF7;
                    billing.MREF8 = req.body.MREF8;
                    billing.MREF9 = req.body.MREF9;
                    billing.MREF10 = req.body.MREF10;
                    billing.MPARAM1 = req.body.MPARAM1;
                    billing.MPARAM2 = req.body.MPARAM2;

                    billing.save(function(err, billing) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.send({ status: 200, message: 'billing success' });
                            //return res.redirect('https://fpg.faspay.co.id/payment');
                        }
                    });
                    // $.post('https://fpg.faspay.co.id/payment', Billing());
                }

            });
        }
    });
}

var addpromo = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 3) {
                var promo = new Promo();
                promo.id_user = req.user_id;
                promo.title = req.body.title;
                promo.description = req.body.description;
                promo.kode_promo = req.body.kode_promo;
                promo.expired = req.body.expired;
                promo.flag_promo = req.body.flag_promo;
                promo.photo_promo = req.body.photo_promo;
                promo.nominal = req.body.nominal;
                var imageSaver = new ImageSaver();
                var pictname = new Date().getTime();

                if (req.body.photo_promo != null) {
                    promo.photo_promo = "https://localhost:3000/upload/photo/" + pictname + ".jpg";
                    imageSaver.saveFile("public/image" + pictname + ".jpg", req.body.photo_promo)
                        .then((data) => {
                            console.log("upload photo success");
                        })
                        .catch((err) => {
                            res.json({ status: 400, message: err });
                        })
                }
                promo.save(function(err, promo) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.send({ status: 200, message: 'promo berasil ditambahkan' });
                    }

                });

            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var deletepromo = function(req, res, next) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 3) {
                var promo = req.params.id_promo;
                Promo.findOneAndRemove(promo, function(err, removepromo) {
                    if (!removepromo) {
                        res.send({ status: 404, message: 'Promo not found' });
                    } else if (err) {
                        res.send({ status: 404, message: 'Error in deleting promo' });
                    } else {
                        res.json({ status: 204, message: "Promo Removed!" });
                    }
                });
                return next;
            } else {
                res.json({ status: 403, message: "Forbidden access for this user" });
            }
        }
        return next;
    });
}

var getAllPromo = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 3) {
                if (err) {
                    res.send({ status: 404, message: 'Not Found' });
                } else {
                    User.findOne({ id_user: req.id_user }).populate('promos').exec(function(err, user) {
                        if (!user) {
                            res.send({ status: 404, message: 'admin Not Found' });
                        } else {
                            var provider_trip = provider.trips;
                            res.send({ status: 200, message: 'Get Trip Provider Success', provider_trip });
                        }
                    });
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var postReview = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 1 || user.role == 2) {
                //var review_booking = req.params.id_booking;
                Booking.findOne({ 'id_booking': req.params.id_booking }, function(err, booking) {
                    if (!booking) {
                        res.send({ status: 404, message: 'Booking Not Found' });
                    } else if (err) {
                        res.send({ status: 404, message: 'Error' });
                    } else if (booking.id_statusBooking == 7) {
                        var review = new Review();
                        review.id_booking = booking._id;
                        review.id_trip = booking.id_trip;
                        review.field = req.body.field;
                        review.rate = req.body.rate;
                        if (req.body.field == null || req.body.field == '' || req.body.rate == null || req.body.rate == '') {
                            res.json({ status: 400, success: false, message: 'Make sure you give rate and review to the trip' });
                        } else {
                            review.save(function(err, review_trip) {
                                if (err) {
                                    res.status(500).send(err)
                                } else {
                                    Trip.findOne({ 'id_trip': booking.id_trip }, function(err, trip) {
                                        if (!trip) {
                                            res.send({ status: 404, message: 'Trip Not Found' });
                                        } else if (err) {
                                            res.status(500).send(err)
                                        } else {
                                            trip.rate_total = trip.rate_total + review_trip.rate;
                                            trip.rate_div = trip.rate_div + 1;
                                            trip.save(function(err, trip) {
                                                if (err) {
                                                    res.status(500).send(err)
                                                } else {
                                                    res.send({ status: 200, message: 'Successfully added rate and review!' });
                                                }
                                            })
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        res.send({ status: 404, message: 'Error: Cannot post review!' });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user" });
            }
        }
    });
}

var getBookingUser = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            var aaa = req.user_id;
            Booking.find({ 'id_user': aaa }, function(err, bookinguser) {
                if (err) {
                    res.json({ status: 402, message: err, data: "" });
                } else {
                    res.json({ status: 200, message: "succes get booking", data: bookinguser });
                }
            });
        }
    });
}

var getBookingDetailbyId = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            Booking.findById(req.params.id, function(err, booking) {
                if (err) {
                    res.json({ status: 402, message: err, data: "" });
                } else {
                    res.json({ status: 200, message: "succes get booking", data: booking });
                }
            });
        }
    });
}

var userLogout = function(req, res) {
    console.log('User Id', req.user._id);
    User.findByIdAndRemove(req.user._id, function(err) {
        if (err) res.send(err);
        res.json({ message: 'User Deleted!' });
    })
}

module.exports = {
    getProfile: getProfile,
    editProfile: editProfile,
    modifyPassword: modifyPassword,
    registerProvider: registerProvider,
    billing: billing,
    addpromo: addpromo,
    deletepromo: deletepromo,
    getAllPromo: getAllPromo,
    postReview: postReview,
    getBookingUser: getBookingUser,
    editPhotoProfile: editPhotoProfile,
    getBookingDetailbyId: getBookingDetailbyId,
    userLogout: userLogout
}