var mongoose = require('mongoose');
var User = require('../models/user');
var Trip = require('../models/trip');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/backendtravinesia");
 
autoIncrement.initialize(connection);

var PromoSchema = new Schema({
	id_promo		:{type:String},
	id_user			:{type:String},
	title 			:{type:String},
	photo_promo		:{type:String},
	description		:{type:String},
	kode_promo		:{type:String},
	expired			:{type:Date},
	status_promo	:{type:String},
	flag_promo 		:{type:String},
	nominal			:{type: Number}
});
PromoSchema.plugin(autoIncrement.plugin, {model: 'Promo', field: 'id_promo', startAt: 1});

module.exports = mongoose.model('Promo', PromoSchema);