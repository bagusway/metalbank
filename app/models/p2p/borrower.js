var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/metalbank");
 
autoIncrement.initialize(connection);
var BorrowerSchema = new Schema({
    borrower_id: { type: String, },
	borrower_name: { type: String, },
	saldo:{type: String},

});
BorrowerSchema.plugin(autoIncrement.plugin, {model: 'Borrower', field: 'borrower_id', startAt: 1});
module.exports = mongoose.model('borrower', BorrowerSchema);