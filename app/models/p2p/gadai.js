var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost:27017/metalbank");
 
autoIncrement.initialize(connection);
var GadaiSchema = new Schema({
	borrower_id:{type:String},
	gram: { type: Number, },
	qty:{type: Number},
	all_qty:{type: Number},
	ltv:{type: Number},
	laba:{type: Number},
	all_gram:{type: Number},
	dp:{type: Number},
	dp_price:{type: Number},
	laep:{type: Number},
	laep_price:{type: Number},
	outstanding:{type: Number},
	installment:{type: Number},
	return:{type: Number},
	period:{type: Number},
	price:{type: Number},
	loans:{type: Number}	
});
GadaiSchema.plugin(autoIncrement.plugin, {model: 'Gadai', field: 'gadai_id', startAt: 1});
module.exports = mongoose.model('Gadai', GadaiSchema);