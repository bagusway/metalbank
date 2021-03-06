//var User = require('../models/user');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/backendtravinesia");

autoIncrement.initialize(connection);

var trip_nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 50],
        message: 'Max 50 Characters'
    })
];

var descriptionValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 2000],
        message: 'Max 2000 Characters'
    })
];

var notes_travelerValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 2000],
        message: 'Max 2000 Characters'
    })
];

var TripSchema = new Schema({
    trip_name: { type: String, validate: trip_nameValidator },
    id_type_trip: {
        type: Schema.Types.ObjectId,
        ref: 'Typetrip'
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: 'Categorytrip'
    }],
    facility: [{
        type: Schema.Types.ObjectId,
        ref: 'Facilitytrip'
    }],
    id_province: {
        type: Schema.Types.ObjectId,
        ref: 'Province'
    },
    id_status_trip: { type: [Number] }, //ubah ke array, inputannya defaultnya [1,1,1,1,1]
    id_promo: { type: Number, default: 0 },
    days: { type: Number },
    night: { type: Number },
    date_trip: { type: [Date] },
    zone_time: { type: String },
    publish_price: { type: Number },
    service_fee: { type: Number }, //5% from publish_price
    fixed_price: { type: Number },
    min_qty_group: { type: [String] },
    publish_price_group: { type: [Number] },
    service_fee_group: { type: [Number] },
    fixed_price_group: { type: [Number] },
    quota_trip: { type: Number }, //ubah ke array
    quota_left: { type: [Number] },
    description: { type: String, validate: descriptionValidator },
    notes_traveler: { type: String, validate: notes_travelerValidator },
    notes_meeting_point: { type: String },
    photo_trip: { type: [String] },
    rate_total: { type: Number, default: 0 },
    rate_div: { type: Number, default: 0 },
    latitude: { type: Number },
    longitude: { type: Number },
    valid: { type: Number, default: 1 },
    checked_date: { type: Number },
    discount_date: { type: [Number] },
    flag_discount: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider'
    }


});

TripSchema.plugin(autoIncrement.plugin, { model: 'Trip', field: 'id_trip', startAt: 1 });

module.exports = mongoose.model('Trip', TripSchema);