var User = require('../models/user');
var Trip = require('../models/trip');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/backendtravinesia");

autoIncrement.initialize(connection);

var travel_nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 30],
        message: 'Max 30 Characters'
    })
];

var sloganValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 30],
        message: 'Max 50 Characters'
    })
];

var descriptionValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 150],
        message: 'Max 150 Characters'
    })
];

var provinceValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 25],
        message: 'Max 20 Characters'
    })
];

var office_addressValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 100],
        message: 'Max 100 Characters'
    })
];

var office_phone_numberValidator = [
    validate({
        validator: 'isNumeric',
        //arguments: [30],
        message: 'Must be phone number'
    }),
    validate({
        validator: 'isLength',
        arguments: [0, 14],
        message: 'Max 14 Characters'
    })
];

var domainValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 15],
        message: 'Max 15 Characters'
    })
];

var ProviderSchema = new Schema({
    id_user: { type: String, ref: 'User', },
    travel_name: {
        type: String,
        unique: true,
        validate: {
            validator: function(v, cb) {
                Provider.find({ travel_name: v }, function(err, docs) {
                    cb(docs.length == 0);
                });
            },
            message: 'status: 400, message: Provider Name Already exist!'
        }
    },
    travel_name: { type: String },
    slogan: { type: String, validate: sloganValidator },
    description: { type: String, validate: descriptionValidator },
    office_address: { type: String, validate: office_addressValidator },
    province: {
        type: Schema.Types.ObjectId,
        ref: 'Province'
    },
    office_phone_number: { type: String, validate: office_phone_numberValidator },
    domain: {
        type: String,
        unique: true,
        validate: {
            validator: function(v, cb) {
                Provider.find({ domain: v }, function(err, docs) {
                    cb(docs.length == 0);
                });
            },
            message: 'status: 400, message: Domain Already exist!'
        }
    },
    domain: { type: String },
    logo: { type: String },
    medsoc_account: { type: String },
    cover: { type: String },
    balance: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    trips: [{
        type: Schema.Types.ObjectId,
        ref: 'Trip'
    }]
});


ProviderSchema.plugin(autoIncrement.plugin, { model: 'Provider', field: 'id_provider', startAt: 1 });

var Provider = mongoose.model('Provider', ProviderSchema);
module.exports = mongoose.model('Provider', ProviderSchema);