var User = require('../models/user');
var Provider = require('../models/provider');
var Trip = require('../models/trip');
var jwt = require('jsonwebtoken');
var { secret } = require('../config/index');
var ImageSaver = require('image-saver-nodejs/lib');
var multer = require('multer');
var Booking = require('../models/booking');
var Billing = require('../models/billing');
var Promo = require('../models/promo');
var Expire = require('../models/booking_expire');
var Status = require('../models/status_payment');
var Detail_traveller = require('../models/traveller_detail');
var Provider_balance = require('../models/provider_balance');
var moment = require('moment');
var fs = require('fs');
var pdf = require('dynamic-html-pdf');
var ejs = require('ejs');
var mongoose = require('mongoose');

var addBooking = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            Trip.findOne({ _id: req.body._id, valid: 1 }, function(err, trip) {
                if (!trip) {
                    res.send({ status: 404, message: 'Trip not availabe!' });
                } else {
                    var startDate = req.body.startDate_trip;
                    for (i = 0; i < trip.date_trip.length; i++) {
                        if (moment(trip.date_trip[i]).isSame(startDate, 'day')) {
                            trip.quota_left[i] = trip.quota_left[i] - req.body.quantity;
                        } else {
                            trip.quota_left[i] = trip.quota_left[i]
                        }
                    }
                    Trip.updateOne({ _id: trip._id }, { $set: { 'quota_left': trip.quota_left } }, function(err, data) {
                        if (err) console.log('Add booking err:', err);
                        new Booking({
                            id_user: req.user_id,
                            id_trip: req.body._id,
                            startDate_trip: startDate,
                            endDate_trip: moment(req.body.startDate_trip, "YYYY-MM-DD").add(trip.days, 'day'),
                            publish_price: req.body.publish_price,
                            fixed_price: req.body.fixed_price,
                            quantity: req.body.quantity,
                            id_type_trip: req.body.id_type_trip
                        }).save(function(err, booking) {
                            if (err) console.log('Add booking err:', err);
                            else {
                                Booking.findById(booking._id)
                                    .populate({
                                        path: "id_trip id_type_trip",
                                        select: 'type_trip provider rate_div rate_total days night photo_trip fixed_price',
                                        populate: {
                                            path: "provider",
                                            select: 'travel_name'
                                        }
                                    })
                                    .exec(function(err, data) {
                                        if (err) console.log('Add booking err:', err);
                                        else res.status(200).send(data);
                                    });
                            }
                        });
                    });

                }
            });
        }
    });
}

var postDetailbooking = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            Booking.findById(req.body._id, function(err, booking) {
                if (!booking) {
                    res.send({ status: 404, message: 'Booking not found!' });
                } else {
                    booking.order_name = req.body.order_name;
                    booking.order_email = req.body.order_email;
                    booking.order_telephone = req.body.order_telephone;
                    booking.notes_for_provider = req.body.notes;
                    booking.flag_asuransi = req.body.flag_asuransi || booking.flag_asuransi;
                    booking.asuransi_price = req.body.asuransi_price;
                    booking.id_promo = req.body.id_promo;
                    booking.flag_promo = req.body.flag_promo || booking.flag_promo;
                    booking.promo_fee = req.body.promo_fee;
                    booking.uniq_code = req.body.uniq_code;
                    booking.coded_amount = booking.publish_price + booking.asuransi_price - booking.promo_fee - booking.uniq_code;
                    booking.save(function(err, result) {
                        if (err) {
                            res.status(500).send(err)
                        } else {
                            Booking.findById(result._id).select('startDate_trip endDate_trip quantity order_name order_email order_telephone publish_price uniq_code asuransi_price promo_fee coded_amount').exec(function(err, data) {
                                if (err) console.log('Add detail booking err:', err);
                                else res.status(200).send(data);
                            });
                        }
                    });
                }
            });

        }
    });
}

var addPaymentbooking = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            Booking.findById(req.body._id, function(err, booking) {
                if (!booking) {
                    res.send({ status: 404, message: 'Booking not found!' });
                } else {
                    var status_payment = 1;
                    Status.findOne({ 'id_status_payment': status_payment }, function(err, status) {
                        if (err) {
                            res.status(500).send(err)
                        } else {
                            booking.admin_fee = req.body.admin_fee;
                            booking.no_booking = req.body.no_booking;
                            booking.id_paymentMethod = req.body.id_paymentMethod;
                            booking.id_typePayment = req.body.id_typePayment;
                            booking.id_statusPayment = status._id;
                            booking.coded_amount = booking.coded_amount + booking.admin_fee;
                            booking.save(function(err, data) {
                                if (err) {
                                    res.status(500).send(err)
                                } else {
                                    Booking.findById(booking._id)
                                        .select('id_paymentMethod id_typePayment flag_expired')
                                        .populate('id_paymentMethod id_typePayment')
                                        .exec(function(err, data) {
                                            if (err) console.log('Add payment booking err:', err);
                                            else {
                                                var newExpire = new Expire({
                                                    booking_expire: data._id
                                                }).save(function(err, result) {
                                                    if (err) console.log('Add payment booking err:', err);
                                                    else {
                                                        res.status(200).send(data)
                                                    }
                                                });
                                            }
                                        });
                                }
                            });
                        }
                    })
                }
            });
        }
    });
}

var updateStatuspayment = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            Booking.findById(req.body._id, function(err, booking) {
                if (!booking) {
                    res.send({ status: 404, message: 'Belum ada transaksi' });
                } else {
                    Status.findById(booking.id_statusPayment, function(err, status) {
                        var updatestatus = req.body.id_statusPayment;
                        if (!status) {
                            res.send({ status: 404, message: 'Status Not Found' });
                        } else if (status.id_status_payment != updatestatus - 1) {
                            res.send({ status: 404, message: 'Forbidden!', data: booking });
                        } else {
                            Status.findOne({ 'id_status_payment': updatestatus }, function(err, id_status) {
                                if (err) {
                                    console.log('Add payment booking err:', err);
                                } else {
                                    booking.id_statusPayment = id_status._id;
                                    booking.save(function(err, result) {
                                        if (err) {
                                            res.status(500).send(err)
                                        } else {
                                            res.send({ status: 200, message: 'Status changed!', data: result });
                                        }
                                    });
                                }
                            });
                        }
                    })
                }
            });
        }
    });
}

var addTravellerdetail = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            var booking_id = req.body._id;
            Booking.findById(booking_id, function(err, booking) {
                if (!booking) {
                    res.send({ status: 404, message: 'Belum ada transaksi' });
                } else if (req.body.save_status == 0) {
                    var traveller = new Detail_traveller();
                    traveller.traveller_name = req.body.traveller_name;
                    traveller.traveller_age = req.body.traveller_age;
                    traveller.traveller_identity = req.body.traveller_identity;

                    booking.traveller_detail.push(traveller);
                    booking.save();
                    traveller.id_booking = booking;
                    traveller.save(function(err, traveller) {
                        if (err) {
                            res.status(500).send(err)
                        } else {
                            res.send({ status: 200, message: 'Penambahan berhasil dan disimpan Sementara' });
                        }
                    });
                } else if (req.body.save_status == 1) {
                    Status.findById(booking.id_statusPayment, function(err, status) {
                        var updatestatus = 4;
                        if (!status) {
                            res.send({ status: 404, message: 'Status Not Found' });
                        } else if (status.id_status_payment != updatestatus - 1) {
                            res.send({ status: 404, message: 'Forbidden!', data: booking });
                        } else {
                            Status.findOne({ 'id_status_payment': updatestatus }, function(err, id_status) {
                                if (err) {
                                    console.log('Add traveller detail booking err:', err);
                                } else {
                                    booking.id_statusPayment = id_status._id;
                                    booking.save(function(err, result) {
                                        if (err) {
                                            res.status(500).send(err)
                                        } else {
                                            var traveller = new Detail_traveller();
                                            traveller.traveller_name = req.body.traveller_name;
                                            traveller.traveller_age = req.body.traveller_age;
                                            traveller.traveller_identity = req.body.traveller_identity;

                                            booking.traveller_detail.push(traveller);
                                            booking.save();
                                            traveller.id_booking = booking;
                                            traveller.save(function(err, traveller) {
                                                if (err) {
                                                    res.status(500).send(err)
                                                } else {
                                                    res.send({ status: 200, message: 'Status changed and Data saved!', data: traveller });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    })
                }
            });
        }
    });
}

var config = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    base: 'file:///E:/backend2.0-master/'
}

var geteTicketTraveller = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (err) {
            return res.send(err);
        } else if (!user) {
            res.json({ status: 402, message: err, data: "User not found!" });
        } else {
            Booking.findById(req.params._id)
                .select('startDate_trip no_booking quantity traveller_detail id_trip id_type_trip id_statusPayment')
                .populate({
                    path: "id_trip id_type_trip traveller_detail",
                    select: 'type_trip trip_name provider days night traveller_name traveller_age traveller_identity',
                    populate: {
                        path: "provider",
                        select: 'travel_name office_phone_number'
                    }
                })
                .exec(function(err, booking) {
                    if (!booking) {
                        res.json({ status: 402, message: err, data: "Booking not found!" });
                    } else {
                        Status.findById(booking.id_statusPayment, function(err, status) {
                            if (err) {
                                return res.send(err);
                            } else if (status.id_status_payment != 4) {
                                res.send({ status: 404, message: 'Forbidden!', data: booking });
                            } else if (status.id_status_payment == 4) {
                                var booking_date = moment(booking.startDate_trip).format('dddd, D MMMM YYYY');;
                                var compiled = fs.readFileSync('./views/e-ticket.html', 'utf8');
                                var document = {
                                    type: 'file',
                                    template: compiled,
                                    context: {
                                        booking: booking,
                                        booking_date: booking_date
                                    },
                                    path: '../e-ticket.pdf'
                                };
                                pdf.create(document, config)
                                    .then(res => {
                                        console.log(res);
                                    })
                                    .catch(error => {
                                        console.error(error);
                                    })
                            }
                        })
                    }
                });
        }
    });
}

var confirmationBookMepo = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (err) {
            return res.send(err);
        } else if (!user) {
            res.json({ status: 402, message: err, data: "User not found!" });
        } else {
            Booking.findById(req.body._id, function(err, booking) {
                if (!booking) {
                    res.json({ status: 402, message: err, data: "Booking not found!" });
                } else {
                    Status.findById(booking.id_statusPayment, function(err, status) {
                        if (err) {
                            return res.send(err);
                        } else if (status.id_status_payment != 5) {
                            res.send({ status: 404, message: 'Forbidden!', data: booking });
                        } else if (status.id_status_payment == 5) {
                            var date_now = new Date().getTime();
                            if (moment(booking.startDate_trip).isSame(date_now, 'day')) {
                                var update_status = 6;
                                if (status.id_status_payment != update_status - 1) {
                                    res.send({ status: 404, message: 'Forbidden!', data: booking });
                                } else {
                                    Status.findOne({ 'id_status_payment': update_status }, function(err, id_status) {
                                        if (err) {
                                            console.log('Confirmation booking err:', err);
                                        } else {
                                            booking.id_statusPayment = id_status._id;
                                            booking.save(function(err, result) {
                                                if (err) {
                                                    res.status(500).send(err)
                                                } else {
                                                    var id_trip = mongoose.Types.ObjectId(booking.id_trip);
                                                    Provider.findOne({ trips: id_trip }, function(err, provider) {
                                                        if (err) {
                                                            res.json({ status: 402, message: err, data: "" });
                                                        } else {
                                                            var providerbalance = new Provider_balance();
                                                            providerbalance.id_provider = provider._id;
                                                            providerbalance.id_trip = booking.id_trip;
                                                            providerbalance.id_booking = booking._id;
                                                            providerbalance.fixed_payment = booking.fixed_price;
                                                            providerbalance.quantity = booking.quantity;
                                                            providerbalance.total_payment = booking.fixed_price * booking.quantity;
                                                            providerbalance.no_booking_payment = booking.no_booking;
                                                            providerbalance.balance_history = provider.balance + providerbalance.total_payment;
                                                            providerbalance.save(function(err, result) {
                                                                if (err) console.log('Add Confirmation booking err:', err);
                                                                else {
                                                                    var balance_now = provider.balance + providerbalance.total_payment;
                                                                    Provider.findByIdAndUpdate(provider._id, { $set: { 'balance': balance_now } }, function(err, trip_update) {
                                                                        if (err) console.log('Add Confirmation booking err:', err);
                                                                        else {
                                                                            res.send({ status: 200, message: 'Confimartion Booking Meeting Point Success' });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                    });
                                }
                            } else {
                                res.send({ status: 404, message: 'Forbidden!', data: booking });
                            }
                        }
                    });
                }
            });

        }
    });
}

var getBookinguser = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (err) {
            return res.send(err);
        } else if (!user) {
            res.json({ status: 402, message: err, data: "User not found!" });
        } else {
            var id_payment_8 = mongoose.Types.ObjectId("5b7536650730bd35ffbb2bd4");
            var id_payment_9 = mongoose.Types.ObjectId("5b7536910730bd35ffbb2c38");
            Booking.find({ "id_statusPayment": { $nin: [id_payment_8, id_payment_9] } })
                .select('_id startDate_trip endDate_trip id_statusPayment no_booking coded_amount id_trip')
                .populate({
                    path: "id_trip id_statusPayment",
                    select: 'trip_name photo_trip days night provider id_status_payment payment_status',
                    populate: {
                        path: "provider",
                        select: 'travel_name'
                    }
                })
                .exec(function(err, booking_user) {
                    if (err) {
                        return res.send(err);
                    } else {
                        res.json({ status: 200, message: "Get Booking User Success", data: booking_user });
                    }
                })
        }
    })
}

var getHistorybooking = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (err) {
            return res.send(err);
        } else if (!user) {
            res.json({ status: 402, message: err, data: "User not found!" });
        } else {
            var id_payment_8 = mongoose.Types.ObjectId("5b7536650730bd35ffbb2bd4");
            var id_payment_9 = mongoose.Types.ObjectId("5b7536910730bd35ffbb2c38");
            Booking.find({ "id_statusPayment": { $in: [id_payment_8, id_payment_9] } })
                .select('_id startDate_trip endDate_trip id_statusPayment no_booking id_trip')
                .populate({
                    path: "id_trip id_statusPayment",
                    select: 'trip_name photo_trip days night provider id_status_payment payment_status',
                    provider: {
                        path: "provider",
                        select: 'travel_name'
                    }
                })
                .exec(function(err, booking_user) {
                    if (err) {
                        return res.send(err);
                    } else {
                        res.json({ status: 200, message: "Get History Booking User Success", data: booking_user });
                    }
                })
        }
    })
}

var getDetailBooking = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (err) {
            return res.send(err);
        } else if (!user) {
            res.json({ status: 402, message: err, data: "User not found!" });
        } else {
            Booking.findById(req.params.id_booking, function(err, booking) {
                var id_user_booking = mongoose.Types.ObjectId(booking.id_user);
                var id_user = mongoose.Types.ObjectId(user._id);
                if (!booking) {
                    res.json({ status: 402, message: err, data: "Booking not found!" });
                } else if (id_user_booking.equals(id_user)) {
                    Expire.findOne({ 'booking_expire': booking._id }, function(err, expire) {
                        if (err) {
                            return res.send(err);
                        } else if (expire == null) {
                            var failed_status = 9;
                            Status.findOne({ 'id_status_payment': failed_status }, function(err, status) {
                                if (err) {
                                    res.status(500).send(err)
                                } else {
                                    booking.id_statusPayment = status._id;
                                    booking.flag_expired = false;
                                    booking.save(function(err, result) {
                                        if (err) {
                                            res.status(500).send(err)
                                        } else {
                                            res.send({ status: 404, message: 'Booking Expired!' });
                                        }
                                    });
                                }
                            })
                        } else if (expire) {
                            Booking.findById(booking._id)
                                .select('_id startDate_trip endDate_trip no_booking id_trip coded_amount id_statusPayment')
                                .populate({
                                    path: "id_trip id_statusPayment",
                                    select: 'trip_name id_type_trip days night latitude longtitude payment_status',
                                    populate: {
                                        path: "id_type_trip",
                                        select: 'type_trip'
                                    }
                                })
                                .exec(function(err, data) {
                                    if (err) {
                                        return res.send(err);
                                    } else if (booking) {
                                        res.send({ status: 200, message: 'Booking Detail!', data: data })
                                    }
                                })
                        }
                    })
                }
            })
        }
    });
}


module.exports = {
    addBooking: addBooking,
    postDetailbooking: postDetailbooking,
    addPaymentbooking: addPaymentbooking,
    updateStatuspayment: updateStatuspayment,
    addTravellerdetail: addTravellerdetail,
    geteTicketTraveller: geteTicketTraveller,
    confirmationBookMepo: confirmationBookMepo,
    getBookinguser: getBookinguser,
    getHistorybooking: getHistorybooking,
    getDetailBooking: getDetailBooking,
    getBookinguser: getBookinguser,
    getHistorybooking: getHistorybooking
}