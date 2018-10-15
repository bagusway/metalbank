var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/backendtravinesia");
 
autoIncrement.initialize(connection);

var ReviewSchema = new Schema({
    id_trip: { type: String },
    id_booking: { type: String },
    rate: { type: Number },
    field:{type:String}
});

ReviewSchema.plugin(autoIncrement.plugin, {model: 'Review', field: 'id_review', startAt: 1});

module.exports = mongoose.model('Review', ReviewSchema);

