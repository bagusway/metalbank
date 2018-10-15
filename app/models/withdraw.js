var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/backendtravinesia");
 
autoIncrement.initialize(connection);

var WithdrawSchema = new Schema({
    id_provider: {type:String},
    bank_name: { type: String },
    account_number: { type: Number },
    account_owner: { type: String },
    withdraw_total: {type:String},
    withdraw_status: {type: String, default: 1}
});

module.exports = mongoose.model('Withdraw', WithdrawSchema);

