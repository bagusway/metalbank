var User = require('../models/user');
var Trip = require('../models/trip');
var Provider = require('../models/provider');
var Withdraw = require('../models/withdraw');
var Province = require('../models/province');
var TypeTrip = require('../models/type_trip');
var Booking = require('../models/booking');
var Status = require('../models/status_payment');
var jwt = require('jsonwebtoken');
var { secret } = require('../config/index');
var ImageSaver = require('image-saver-nodejs/lib');
var multer = require('multer');
var fs = require('fs');
var pdf = require('dynamic-html-pdf');
var ejs = require('ejs');
var moment = require('moment');
var each = require('foreach');
// var async = require('asyncawait/async');
// var await = require('asyncawait/await');


var getProfileProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                if (err) {
                    res.send({ status: 404, message: 'Provider Not Found' });
                } else {
                    Provider.findOne({ id_user: req.id_user })
                        .select('travel_name logo cover slogan description office_address province office_phone_number')
                        .populate('province', 'province_name')
                        .exec(function(err, provider) {
                            if (!provider) {
                                res.send({ status: 404, message: 'Provider Not Found' });
                            } else {
                                res.send({ status: 200, message: 'Get Profile Provider Success', provider });
                            }
                        });
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var editProfileProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                Provider.findOne({ id_user: req.id_user }, function(err, provider) {
                    if (!provider) {
                        res.send({ status: 404, message: 'Provider Not Found' });
                    } else {
                        provider.slogan = req.body.slogan || provider.slogan;
                        provider.description = req.body.description || provider.description;
                        provider.office_address = req.body.office_address || provider.office_address;
                        provider.province = req.body.province || provider.province;
                        provider.office_phone_number = req.body.office_phone_number || provider.office_phone_number;
                        provider.medsoc_account = req.body.medsoc_account || provider.medsoc_account;
                    }
                    provider.save(function(err, provider) {
                        if (err) {
                            res.status(500).send(err)
                        } else {
                            res.send({ status: 200, message: 'Your Provider Profile Has Been Updated!', data: provider });
                        }
                    });
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var editCoverProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                Provider.findOne({ id_user: req.id_user }, function(err, provider) {
                    if (!provider) {
                        res.send({ status: 404, message: 'Provider Not Found' });
                    } else {
                        provider.cover = provider.cover;
                        var imageSaver = new ImageSaver();
                        var pictname = new Date().getTime();
                        if (req.body.cover != null) {
                            if (provider.cover != null) {
                                var del_pict = provider.cover.split('http://localhost/upload/photo/')[1];
                                fs.unlinkSync('C:/xampp/htdocs/images/provider/cover/' + del_pict);

                                provider.cover = "http://localhost/upload/photo/" + pictname + ".jpg";
                                imageSaver.saveFile("C:/xampp/htdocs/images/provider/cover/" + pictname + ".jpg", req.body.cover)
                                    .then((data) => {
                                        console.log("upload photo success");
                                    })
                                    .catch((err) => {
                                        res.json({ status: 400, message: err });
                                    })
                            } else {
                                provider.cover = "http://localhost/upload/photo/" + pictname + ".jpg";
                                imageSaver.saveFile("C:/xampp/htdocs/images/provider/cover/" + pictname + ".jpg", req.body.cover)
                                    .then((data) => {
                                        console.log("upload photo success");
                                    })
                                    .catch((err) => {
                                        res.json({ status: 400, message: err });
                                    })
                            }
                            provider.save(function(err, provider) {
                                if (err) {
                                    res.status(500).send(err)
                                } else {
                                    res.send({ status: 200, message: 'Your cover has been updated' });
                                }
                            });
                        } else {
                            res.send({ status: 400, message: 'Make sure upload your cover picture!' });
                        }
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var editLogoProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                Provider.findOne({ id_user: req.id_user }, function(err, provider) {
                    if (!provider) {
                        res.send({ status: 404, message: 'Provider Not Found' });
                    } else {
                        provider.logo = provider.logo;
                        var imageSaver = new ImageSaver();
                        var pictname = new Date().getTime();
                        if (req.body.logo != null) {
                            if (provider.logo != null) {
                                var del_pict = provider.logo.split('http://localhost/images/provider/')[1];
                                fs.unlinkSync('C:/xampp/htdocs/images/provider/' + del_pict);

                                provider.logo = "http://localhost/images/provider/" + pictname + ".jpg";
                                imageSaver.saveFile("C:/xampp/htdocs/images/provider/" + pictname + ".jpg", req.body.logo)
                                    .then((data) => {
                                        console.log("upload photo success");
                                    })
                                    .catch((err) => {
                                        res.json({ status: 400, message: err });
                                    })
                            } else {
                                provider.logo = "http://localhost/upload/photo/" + pictname + ".jpg";
                                imageSaver.saveFile("C:/xampp/htdocs/images/provider/" + pictname + ".jpg", req.body.logo)
                                    .then((data) => {
                                        console.log("upload photo success");
                                    })
                                    .catch((err) => {
                                        res.json({ status: 400, message: err });
                                    })
                            }
                            provider.save(function(err, provider) {
                                if (err) {
                                    res.status(500).send(err)
                                } else {
                                    res.send({ status: 200, message: 'Your Logo has been updated' });
                                }
                            });
                        } else {
                            res.send({ status: 400, message: 'Make sure logo your cover picture!' });
                        }
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var etalaseTravel = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                if (err) {
                    res.send({ status: 404, message: 'Provider Not Found' });
                } else {
                    Provider.findOne({ id_user: req.id_user })
                        .select('travel_name logo cover slogan office_address created_at office_phone_number')
                        .populate({
                            path: "province trips",
                            select: 'province_name trip_name rate_div rate_total publish_price photo_trip days night discount_date id_type_trip',
                            populate: {
                                path: "id_type_trip",
                                select: 'type_trip'
                            }
                        })
                        .exec(function(err, provider) {
                            if (!provider) {
                                res.send({ status: 404, message: 'Provider Not Found' });
                            } else {
                                res.send({ status: 200, message: 'Get Profile Provider Success', provider });
                            }
                        });
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var salesTransactionProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                if (err) {
                    res.send({ status: 404, message: 'Provider Not Found' });
                } else {
                    Provider.findOne({ id_user: req.id_user }, function(err, id_provider) {
                        if (!id_provider) {
                            res.send({ status: 404, message: 'Provider Not Found' });
                        } else {
                            Trip.find({ provider: id_provider._id, valid: 1 }, { photo_trip: { $slice: 1 } })
                                .select('trip_name photo_trip category days night publish_price quota_trip quota_left date_trip id_type_trip')
                                .populate({
                                    path: "category id_type_trip",
                                    select: 'category_name type_trip'
                                }).exec(function(err, trip) {
                                    if (err) {
                                        return res.send(err);
                                    } else if (trip) {
                                        res.send({ status: 200, message: 'Get Data Trip Success!', data: trip });
                                    } else {

                                    }
                                })
                        }
                    })
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var detailSalesTransaction = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                if (err) {
                    res.send({ status: 404, message: 'Provider Not Found' });
                } else {
                    Trip.findById(req.params.id_trip, { photo_trip: { $slice: 1 } })
                        .select('trip_name photo_trip category days night publish_price quota_trip quota_left date_trip id_type_trip')
                        .populate({
                            path: "category id_type_trip",
                            select: 'category_name type_trip'
                        }).exec(function(err, trip) {
                            if (err) {
                                return res.send(err);
                            } else {
                                Booking.find({ "id_trip": req.params.id_trip })
                                    .select('order_name created_at quantity id_statusPayment flag_expired')
                                    .populate({
                                        path: "id_statusPayment",
                                        select: 'payment_status'
                                    })
                                    .exec(function(err, booking) {
                                        if (err) {
                                            return res.send(err);
                                        } else {
                                            res.send({ status: 200, message: 'Get Data Detail Trip Transaction Success!', data: [trip, booking] })
                                        }
                                    })
                            }
                        })
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    })
}

var addTrip = function(req, res, next) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                var trip = new Trip();
                trip.trip_name = req.body.trip_name;
                trip.id_type_trip = req.body.id_type_trip;
                trip.days = req.body.days;
                trip.night = req.body.days - 1;
                trip.date_trip = req.body.date_trip;
                trip.publish_price = req.body.publish_price;
                trip.quota_trip = req.body.quota_trip;
                trip.service_fee = req.body.service_fee;
                trip.fixed_price = req.body.fixed_price;
                trip.description = req.body.description;
                trip.notes_traveler = req.body.notes_traveler;
                trip.notes_meeting_point = req.body.notes_meeting_point;
                trip.id_province = req.body.id_province_trip;
                trip.category = req.body.id_category;
                trip.facility = req.body.id_facility;
                trip.publish_price_group = req.body.publish_price_group;
                trip.service_fee_group = req.body.service_fee_group;
                trip.fixed_price_group = req.body.fixed_price_group;
                var date_length_trip = req.body.date_trip.length;
                trip.checked_date = date_length_trip;
                if (date_length_trip == 1) {
                    trip.id_status_trip = [1];
                    trip.quota_left = [req.body.quota_trip];
                } else if (date_length_trip == 2) {
                    trip.id_status_trip = [1, 1];
                    trip.quota_left = [req.body.quota_trip, req.body.quota_trip];
                } else if (date_length_trip == 3) {
                    trip.id_status_trip = [1, 1, 1];
                    trip.quota_left = [req.body.quota_trip, req.body.quota_trip, req.body.quota_trip];
                } else if (date_length_trip == 4) {
                    trip.id_status_trip = [1, 1, 1, 1];
                    trip.quota_left = [req.body.quota_trip, req.body.quota_trip, req.body.quota_trip, req.body.quota_trip];
                } else if (date_length_trip == 5) {
                    trip.id_status_trip = [1, 1, 1, 1, 1];
                    trip.quota_left = [req.body.quota_trip, req.body.quota_trip, req.body.quota_trip, req.body.quota_trip, req.body.quota_trip];
                }
                var myStringArray = req.body.photo_trip;
                for (var i = 0; i < myStringArray.length; i++) {
                    var imageSaver = new ImageSaver();
                    var pictname = new Date().getTime();
                    var numb = 1 + i;
                    if (req.body.photo_trip != null) {
                        trip.photo_trip[i] = "http://localhost/images/provider/trip/" + pictname + '-' + numb + ".jpg";
                        imageSaver.saveFile("C:/xampp/htdocs/images/provider/trip/" + pictname + '-' + numb + ".jpg", req.body.photo_trip[i])
                            .then((data) => {
                                console.log("upload photo success");
                            })
                            .catch((err) => {
                                res.json({ status: 400, message: err });
                            })
                    }
                }
                Provider.findOne({ id_user: req.id_user }, function(err, provider) {
                    if (!provider) {
                        res.send({ status: 404, message: 'Provider Not Found' });
                    } else {
                        provider.trips.push(trip);
                        provider.save();
                        trip.provider = provider;
                    }
                });
                trip.save(function(err, trip) {
                    if (err) {
                        res.status(500).send(err)
                    } else {
                        res.send({ status: 200, message: 'Trip registered' });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });

}

var editTrip = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                Provider.findOne({ id_user: req.id_user }).select('_id').exec(function(err, provider) {
                    if (err) {
                        res.send({ status: 404, message: 'Error' });
                    } else {
                        Trip.findById(req.params.id, function(err, idtrip) {
                            if (!idtrip) {
                                res.send({ status: 404, message: 'Trip not found!' });
                            } else if (provider._id.equals(idtrip.provider)) {
                                Trip.findById(req.params.id, function(err, trip) {
                                    if (!trip) {
                                        res.send({ status: 404, message: 'Trip Not Found' });
                                    } else {
                                        trip.trip_name = req.body.trip_name || trip.trip_name;
                                        trip.days = req.body.days || trip.days;
                                        trip.night = req.body.night || trip.night;
                                        trip.date_trip = req.body.date_trip;
                                        trip.publish_price = req.body.publish_price || trip.publish_price;
                                        trip.quota_trip = req.body.quota_trip || trip.quota_trip;
                                        trip.notes_traveler = req.body.notes_traveler || trip.notes_traveler;
                                        trip.category = req.body.id_category || trip.category;
                                        trip.facility = req.body.id_facility || trip.facility;
                                        trip.save(function(err, result) {
                                            if (err) {
                                                res.status(500).send(err)
                                            } else {
                                                res.send({ status: 200, message: 'Your Trip Has Been Updated!', data: result });
                                            }
                                        });
                                    }
                                });
                            } else {
                                res.send({ status: 400, message: 'Error, Trip not Found' });
                            }

                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var editPhotoTrip = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                Provider.findOne({ id_user: req.id_user }).select('_id').exec(function(err, provider) {
                    if (err) {
                        res.send({ status: 404, message: 'Error' });
                    } else {
                        Trip.findById(req.params.id, function(err, idtrip) {
                            if (!idtrip) {
                                res.send({ status: 404, message: 'Trip not found!' });
                            } else if (provider._id.equals(idtrip.provider)) {
                                for (var i = 0; i < idtrip.photo_trip.length; i++) {
                                    var imageSaver = new ImageSaver();
                                    var pictname = new Date().getTime();
                                    var numb = 1 + i;
                                    if (req.body.photo_trip[i] != '') {
                                        if (idtrip.photo_trip[i] != null) {
                                            var del_pict = idtrip.photo_trip[i].split('http://localhost/images/provider/trip/')[1];
                                            fs.unlinkSync('C:/xampp/htdocs/images/provider/trip/' + del_pict);
                                        }
                                        idtrip.photo_trip[i] = "http://localhost/images/provider/trip/" + pictname + '-' + numb + ".jpg";
                                        imageSaver.saveFile("C:/xampp/htdocs/images/provider/trip/" + pictname + '-' + numb + ".jpg", req.body.photo_trip[i])
                                            .then((data) => {
                                                console.log("upload photo success");
                                            })
                                            .catch((err) => {
                                                res.json({ status: 400, message: err });
                                            })
                                    } else if (req.body.photo_trip == '' || req.body.photo_trip == null) {
                                        idtrip.photo_trip[i] = idtrip.photo_trip[i];
                                    }
                                }
                                Trip.updateOne({ _id: req.params.id }, { $set: { 'photo_trip': idtrip.photo_trip } }, function(err, trip_update) {
                                    if (err) {
                                        res.status(500).send(err)
                                    } else {
                                        res.send({ status: 200, message: 'Your Photo Trip Has Been Updated!', data: trip_update });
                                    }
                                });
                            } else {
                                res.send({ status: 404, message: 'Trip not found!' });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}


var deleteTrip = function(req, res, next) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                var trip = req.params.id;
                Provider.findOne({ id_user: req.id_user }).select('_id').exec(function(err, provider) {
                    if (err) {
                        res.send({ status: 404, message: 'Error' });
                    } else {
                        Trip.findById(trip, function(err, idtrip) {
                            if (!idtrip) {
                                res.send({ status: 404, message: 'Trip not found!' });
                            } else if (provider._id.equals(idtrip.provider)) {
                                Trip.findByIdAndRemove(trip, function(err, removetrip) {
                                    if (!removetrip) {
                                        res.send({ status: 404, message: 'Trip not found!' });
                                    } else if (err) {
                                        res.send({ status: 404, message: 'Error in deleting trip' });
                                    } else {
                                        Provider.findOneAndUpdate({ id_user: req.id_user }, { $pull: { "trips": trip } }, function(err, provider) {
                                            if (err) {
                                                return res.status(500).json({ 'error': 'Error in deleting trip' });
                                            } else {
                                                res.json({ status: 204, message: "Trip Removed!" });
                                            }
                                        });
                                    }
                                });
                            } else {
                                res.send({ status: 404, message: 'Trip not found' });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user" });
            }
        }
    });
}

var getDetailEditTrip = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            if (user.role == 2) {
                var trip = req.params.id;
                Provider.findOne({ id_user: req.id_user }).select('_id').exec(function(err, provider) {
                    if (err) {
                        res.send({ status: 404, message: 'Error' });
                    } else {
                        Trip.findById(trip, function(err, idtrip) {
                            if (!idtrip) {
                                res.send({ status: 404, message: 'Trip not found!' });
                            } else {
                                res.json({ status: 200, message: "succes get detail trip", data: idtrip });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user" });
            }
        }
    });
}


var getAllTrip = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                if (err) {
                    res.send({ status: 404, message: 'Not Found' });
                } else {
                    Provider.findOne({ id_user: req.id_user }, function(err, provider) {
                        if (!provider) {
                            res.send({ status: 404, message: 'Provider Not Found' });
                        } else {
                            Trip.find({ 'provider': provider._id }, { photo_trip: { $slice: 1 } })
                                .select('trip_name photo_trip days night category id_type_trip publish_price quota_trip')
                                .populate('id_type_trip category', 'type_trip category_name').exec(function(err, trip) {
                                    res.json({ status: 200, message: 'Get Trip Provider Success', trip });
                                });
                        }
                    });
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var getAllValidTrips = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                if (err) {
                    res.send({ status: 404, message: 'Not Found' });
                } else {
                    Provider.findOne({ id_user: req.id_user }).populate('trips').exec(function(err, providertrip) {
                        if (!providertrip) {
                            res.send({ status: 404, message: 'Provider Not Found' });
                        } else {
                            Trip.find({ valid: 1, provider: providertrip._id }, function(err, valid_trip) {
                                if (err) {

                                } else {
                                    res.json({ status: 200, message: 'Get Valid Trip Provider Success', data: valid_trip });
                                }
                            });
                        }
                    });
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var getAllNotValidTrips = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                if (err) {
                    res.send({ status: 404, message: 'Not Found' });
                } else {
                    Provider.findOne({ id_user: req.id_user }).populate('trips').exec(function(err, providertrip) {
                        if (!providertrip) {
                            res.send({ status: 404, message: 'Provider Not Found' });
                        } else {
                            Trip.find({ valid: 0, provider: providertrip._id }, function(err, notvalid_trip) {
                                if (err) {

                                } else {
                                    res.json({ status: 200, message: 'Get Valid Trip Provider Success', data: notvalid_trip });
                                }
                            });
                        }
                    });
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var withdrawProvider = function(req, res) {
    User.findById(req.user_id).select('name email password role').exec(function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                if (req.body.password) {
                    var checkPassword = user.comparePassword(req.body.password);
                } else {
                    res.json({ status: 400, success: false, message: 'No password provided' });
                    //return next();
                }
                if (!checkPassword) {
                    res.json({ status: 400, success: false, message: 'Wrong Password' });
                    //return next();
                } else {
                    Provider.findOne({ id_user: req.id_user }).select('_id balance').exec(function(err, provider) {
                        if (!provider) {
                            res.send({ status: 404, message: 'Provider not Found' });
                        } else if (err) {
                            res.send({ status: 404, message: 'Error' });
                        } else if (req.body.withdraw_total > provider.balance) {
                            res.send({ status: 404, message: 'Error: Penarikan melebihi total saldo yang ada' });
                        } else {
                            var withdraw = new Withdraw();
                            withdraw.id_provider = provider._id;
                            withdraw.bank_name = req.body.bank_name;
                            withdraw.account_number = req.body.account_number;
                            withdraw.account_owner = req.body.account_owner;
                            withdraw.withdraw_total = req.body.withdraw_total;
                            withdraw.save(function(err, withdraw) {
                                if (err) {
                                    res.status(500).send(err)
                                } else {
                                    res.json({ status: 200, message: 'Penarikan Diajukan', data: withdraw });
                                }
                            });
                        }
                    });
                }
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var providerBalance = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {

            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var cnfrmtripbyProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                Booking.findById(req.body._id, function(err, booking) {
                    if (!booking) {
                        res.json({ status: 402, message: err, data: "Booking not found!" });
                    } else {
                        Status.findById(booking.id_statusPayment, function(err, status) {
                            if (err) {
                                return res.send(err);
                            } else if (status.id_status_payment != 2) {
                                res.send({ status: 404, message: 'Forbidden!' });
                            } else if (status.id_status_payment == 2) {
                                var update_status = 3;
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
                                                    res.send({ status: 200, message: 'Confirmation Transaction Success!' });
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var config = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    base: 'file:///E:/backend2.0-master/'
}

var pdfdetailTransactionTraveller = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                var start_date = req.params.date;
                Booking.find({ 'id_trip': req.params.id_trip, 'startDate_trip': start_date })
                    .select('id_trip quantity startDate_trip traveller_detail order_name order_email order_telephone no_booking')
                    .populate({
                        path: "id_trip traveller_detail",
                        select: 'trip_name id_type_trip days night traveller_identity traveller_age traveller_name',
                        populate: {
                            path: "id_type_trip",
                            select: 'type_trip'
                        }

                    }).exec(function(err, booking) {
                        if (err) {
                            return res.send(err);
                        } else if (booking) {
                            var quantity_total;
                            var total;
                            each(booking, function(value, key, array) {
                                quantity_total = booking[key].quantity;
                                total = quantity_total + booking[key].quantity;
                            })
                            var compare_date = moment(start_date).subtract(2, 'day').format('YYYY-MM-DD');
                            var date_now = moment(new Date()).format('YYYY-MM-DD');
                            if (moment(date_now).isSame(compare_date, 'day')) {
                                var booking_pdf = booking[0];
                                var booking_date = moment(booking_pdf.startDate_trip).format('dddd, D MMMM YYYY');
                                var compiled = fs.readFileSync('./views/daftar_peserta.html', 'utf8');
                                var document = {
                                    type: 'file',
                                    template: compiled,
                                    context: {
                                        booking: booking,
                                        booking_pdf: booking_pdf,
                                        booking_date: booking_date,
                                        total: total
                                    },
                                    path: '../daftar_peserta.pdf'
                                };
                                pdf.create(document, config)
                                    .then(res => {
                                        console.log(res);
                                        //res.json({ status: 200, message: "Get Detail Transaction Booking", data: booking });
                                    })
                                    .catch(error => {
                                        console.error(error);
                                    })
                                res.json({ status: 200, message: "Get PDF Detail Transaction Booking" });
                            } else {
                                res.send({ status: 404, message: 'Forbidden! Daftar Peserta Cannot Download' });
                            }
                        }
                    })
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    })
}

var discountbyProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 2) {
                Provider.findOne({ id_user: req.id_user }).select('_id').exec(function(err, provider) {
                    if (err) {
                        res.send({ status: 404, message: 'Error' });
                    } else if (!provider) {
                        res.send({ status: 404, message: 'Provider not found!' });
                    } else {
                        Trip.findById(req.params.id, function(err, trip) {
                            if (err) {
                                res.send({ status: 404, message: 'Error' });
                            } else if (!trip) {
                                res.send({ status: 404, message: 'Trip not found!' });
                            } else {
                                for (i = 0; i < trip.date_trip.length; i++) {
                                    if (req.body.discount_date[i] == '' || req.body.discount_date[i] == null) {
                                        trip.discount_date[i] = 0;
                                    } else {
                                        trip.discount_date[i] = req.body.discount_date[i];
                                        trip.flag_discount = 1;
                                    }
                                }
                                Trip.updateOne({ _id: req.params.id }, { $set: { 'discount_date': trip.discount_date, 'flag_discount': 1 } }, function(err, quota_update) {
                                    if (err) {
                                        res.status(500).send(err)
                                    } else {
                                        res.send({ status: 200, message: 'Your Discount Has Been Added!', data: quota_update });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var setquoatanullbyProvider = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error 1' });
        } else {
            if (user.role == 2) {
                Provider.findOne({ id_user: req.id_user }).select('_id').exec(function(err, provider) {
                    if (err) {
                        res.send({ status: 404, message: 'Error 2' });
                    } else if (!provider) {
                        res.send({ status: 404, message: 'Provider not found!' });
                    } else {
                        Trip.findById(req.params.id, function(err, trip) {
                            if (!trip) {
                                res.send({ status: 404, message: 'Trip not found!' });
                            } else if (provider._id.equals(trip.provider)) {
                                for (i = 0; i < trip.quota_trip.length; i++) {
                                    if (req.body.quota_trip[i] != '') {
                                        trip.quota_trip[i] = req.body.quota_trip[i];
                                    } else if (req.body.quota_trip == '' || req.body.quota_trip == null) {
                                        trip.quota_trip[i] = trip.quota_trip[i];
                                    }
                                }
                                Trip.updateOne({ _id: req.params.id }, { $set: { 'quota_trip': trip.quota_trip } }, function(err, quota_update) {
                                    if (err) {
                                        res.status(500).send(err)
                                    } else {
                                        res.send({ status: 200, message: 'Your quota trip has been set null!', data: quota_update });
                                    }
                                });
                            } else {
                                res.send({ status: 404, message: 'Not Provider Trip' });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

module.exports = {
    getProfileProvider: getProfileProvider,
    editProfileProvider: editProfileProvider,
    addTrip: addTrip,
    editTrip: editTrip,
    deleteTrip: deleteTrip,
    getAllTrip: getAllTrip,
    getAllValidTrips: getAllValidTrips,
    getAllNotValidTrips: getAllNotValidTrips,
    withdrawProvider: withdrawProvider,
    providerBalance: providerBalance,
    discountbyProvider: discountbyProvider,
    setquoatanullbyProvider: setquoatanullbyProvider,
    editPhotoTrip: editPhotoTrip,
    getDetailEditTrip: getDetailEditTrip,
    editCoverProvider: editCoverProvider,
    editLogoProvider: editLogoProvider,
    etalaseTravel: etalaseTravel,
    salesTransactionProvider: salesTransactionProvider,
    detailSalesTransaction: detailSalesTransaction,
    cnfrmtripbyProvider: cnfrmtripbyProvider,
    pdfdetailTransactionTraveller: pdfdetailTransactionTraveller
}