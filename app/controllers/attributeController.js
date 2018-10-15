var Type = require('../models/type_trip');
var Category = require('../models/category_trip');
var Facility = require('../models/facility_trip');
var Trip = require('../models/trip');
var User = require('../models/user');
var Discussion = require('../models/discussion/discussion');
var Comment = require('../models/discussion/comment');
var Provider = require('../models/provider');
var Province = require('../models/province');
var Typepayment = require('../models/type_payment');
var Payment = require('../models/payment_method');
var Statuspayment = require('../models/status_payment');
var jwt = require('jsonwebtoken');
var { secret } = require('../config/index');
var ImageSaver = require('image-saver-nodejs/lib');
var multer = require('multer');
var fs = require('fs');
var mongoose = require('mongoose');
var pdf = require('html-pdf');
var options = { format: 'A4' };
var ejs = require('ejs');
var cron = require('node-cron');
var each = require('foreach');
var moment = require('moment');



var getType = function(req, res) {

    Trip.find({ 'id_type_trip': req.params.id_type_trip }, function(err, trip) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get type",
                data: trip
            });
        }
    })
}

var getAllType = function(req, res) {
    Type.find({}, function(err, AllType) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all type",
                data: AllType
            });
        }
    })
}
var getCategory = function(req, res) {
    Category.find({ 'category': req.params.category }, function(err, category) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get category",
                data: category
            });
        }
    })
}

var getAllCategory = function(req, res) {
    Category.find({}, function(err, AllCategory) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all category",
                data: AllCategory
            });
        }
    })
}
var getProvince = function(req, res) {
    Province.findOne({ 'id_province': req.params.id_province }, function(err, province) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all Trip",
                data: province
            });
        }
    })
}
var getAllProvince = function(req, res) {
    Province.find({}, function(err, AllProvince) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all Province",
                data: AllProvince
            });
        }
    })
}


var getFacility = function(req, res) {
    Facility.find({}, function(err, facility) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all facility",
                data: facility
            });
        }
    })
}

var getAllTrip = function(req, res) {
    Trip.find({}).select('_id id_trip trip_name days night notes_meeting_point description publish_price photo_trip').populate('provider').exec(function(err, trip) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all trip",
                data: trip
            });
        }
    });
}

var searchAllTrip = function(req, res) {
    Trip.find({ $or: [{ 'id_province': req.params.id_province }, { 'category': req.params.category }] }, function(err, trip) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "Search success",
                data: trip
            });
        }
    });

}

var getAllDiscussion = function(req, res) {
    Discussion.find({ 'id_trip': req.params.id }, function(err, discussion) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({ status: 200, message: "succes get all discussion", data: discussion });
        }
    })
}

var getAllCommentDiscussion = function(req, res) {
    Comment.find({ 'id_trip': req.params.id }, function(err, comment) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({ status: 200, message: "succes get all comment", data: comment });
        }
    })
}

var getDetailTrip = function(req, res) {
    Trip.findById({ _id: req.params.id_trip }, function(err, detail) {
        if (err) {
            return res.send(err);
        } else if (!detail) {
            res.send({ status: 402, message: err, data: "" });
        } else {
            res.json({ status: 200, message: "succes get detail trip", data: detail });
        }
    });
}

var getDetailIDTrip = function(req, res) {
    Trip.findOne({ 'id_trip': req.params.id_trip })
        .select('_id id_trip trip_name days night notes_meeting_point description publish_price photo_trip provider id_province id_type_trip facility category')
        .populate('provider id_province id_type_trip facility category')
        .exec(function(err, detail) {
            if (err) {
                return res.send(err);
            } else if (!detail) {
                res.send({ status: 402, message: err, data: "" });
            } else {
                res.json({ status: 200, message: "succes get detail trip", data: detail });
            }
        });
}

//kode tambahan
var getValidTrips = function(req, res) {
    cron.schedule('0 0 * * *', function() {
        Trip.find({ 'valid': 1 }, function(err, trip) {
            if (trip != '') {
                each(trip, function(value, key, array) {
                    var check_date = moment().add(2, 'day').toDate();
                    var date_now = new Date().getTime();
                    var loop;
                    var pengurangan;
                    var current_date;
                    for (var i = 0; i < trip[key].checked_date; i++) {
                        if (moment(trip[key].date_trip[i]).isSameOrAfter(date_now, 'day')) {
                            if (i === 0) {
                                loop = 0;
                                break;
                            } else {
                                current_date = trip[key].checked_date - i;
                                pengurangan = trip[key].checked_date - current_date;
                                loop = pengurangan;
                                break;
                            }
                        }
                    }
                    if (loop === undefined) {
                        trip[key].valid = 0;
                    }
                    var sisa;
                    var valid_date;
                    for (var j = loop; j < trip[key].checked_date; j++) {
                        if (moment(trip[key].date_trip[j]).isSameOrAfter(check_date, 'day')) {
                            sisa = trip.checked_date - j;
                            valid_date = sisa;
                            break;
                        }
                    }
                    if (valid_date === undefined) {
                        trip[key].valid = 0;
                    }
                    trip[key].save(function(err) {
                        if (!err) {
                            trip[key].valid = trip[key].valid;
                        } else {
                            res.json({ status: 400, success: false, message: 'Update Failed' });
                        }
                    })
                    console.log(trip[key].valid);
                })
            } else {
                res.json({ status: 400, success: false, message: 'Trip not found' });
            }
        });
    });
}

getTripDiscount = function(req, res) {
    Trip.find({ flag_discount: 1 }, { photo_trip: { $slice: 1 } },
        'trip_name days night publish_price rate_total rate_div photo_trip discount_date id_type_trip id_trip').sort({ 'rate_total': -1 }).limit(6).exec(function(err, trip_discount) {
        if (err) {
            return res.send(err);
        } else if (!trip_discount) {
            res.send({ status: 402, message: err, data: "" });
        } else {
            res.json({ status: 200, message: "succes get discount trip", data: trip_discount });
        }
    });
}

var getTypepayment = function(req, res) {
    Typepayment.find({}, function(err, type) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all type",
                data: type
            });
        }
    })
}

var getPaymentmethod = function(req, res) {
    Payment.find({}, function(err, payment) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all payment",
                data: payment
            });
        }
    })
}

var getStatuspayment = function(req, res) {
    Statuspayment.find({}, function(err, status) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all status payment",
                data: status
            });
        }
    })
}

var getTripname = function(req, res) {
    Trip.find({})
        .select('trip_name')
        .exec(function(err, trip) {
            if (err) {
                return res.send(err);
            } else {
                res.json({
                    status: 200,
                    message: "succes get all trip name",
                    data: trip
                });
            }
        })
}

var searchTripbyName = function(req, res) {
    var name = new RegExp(req.params.trip_name, "i")
    Trip.find({ 'trip_name': name }, { photo_trip: { $slice: 1 } })
        .select('trip_name days night publish_price rate_total rate_div photo_trip discount_date id_type_trip id_trip')
        .populate({
            path: "id_type_trip",
            select: 'type_trip'
        })
        .exec(function(err, trip) {
            if (err) {
                return res.send(err);
            } else {
                res.json({
                    status: 200,
                    message: "succes get trip",
                    data: trip
                });
            }
        })

}

var getTripbyCategory = function(req, res) {
    var _id = mongoose.Types.ObjectId(req.params.id_category);
    Trip.find({ category: { $in: [_id] } }, { photo_trip: { $slice: 1 } })
        .select('trip_name days category night publish_price rate_total rate_div photo_trip discount_date id_type_trip id_trip')
        .populate({
            path: "id_type_trip",
            select: 'type_trip'
        })
        .exec(function(err, trip) {
            if (err) {
                return res.send(err);
            } else {
                res.json({
                    status: 200,
                    message: "succes get trip",
                    data: trip
                });
            }
        })
}

var searchAdvance = function(req, res) {
    //create empty query
    var findJSON = {};

    // append criteria if parameters present
    if (req.params.id_category) {
        findJSON.category = req.params.category
    }
    if (req.params.days) {
        findJSON.days = req.params.category
    }
    if (req.params.id_type) {
        findJSON.id_type_trip = req.params.category
    }
    if (req.params.name) {
        var re = new RegExp(req.params.name, 'i');
        findJSON.$or = [
            { 'category': re },
            { 'days': re },
            { 'id_province': re },
        ];
    }

    Trip.find(findJSON).exec(function(err, trip) {
        if (err) {
            return console.error(err);
        }
        res.json(trip);
    });

    if (req.params.id_category || req.params.days || req.params.id_type || req.params.name) {
        Trip.find(findJSON).exec(function(err, trip) {
            if (err) {
                return console.error(err);
            }
            res.json(trip);
        });
    } else {
        res.json([]);
    }
}

module.exports = {
    getType: getType,
    getAllType: getAllType,
    getAllCategory: getAllCategory,
    getCategory: getCategory,
    getFacility: getFacility,
    getAllTrip: getAllTrip,
    getAllProvince: getAllProvince,
    getProvince: getProvince,
    searchAllTrip: searchAllTrip,
    getAllDiscussion: getAllDiscussion,
    getAllCommentDiscussion: getAllCommentDiscussion,
    getValidTrips: getValidTrips,
    getDetailTrip: getDetailTrip,
    getTripDiscount: getTripDiscount,
    getDetailIDTrip: getDetailIDTrip,
    getTypepayment: getTypepayment,
    getPaymentmethod: getPaymentmethod,
    getStatuspayment: getStatuspayment,
    getTripname: getTripname,
    searchTripbyName: searchTripbyName,
    getTripbyCategory: getTripbyCategory,
    searchAdvance: searchAdvance
}