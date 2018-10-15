var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TypepaymentSchema = new Schema({
    id_type_payment: { type: String, },
    type_payment: { type: String, }
});

module.exports = mongoose.model('Typepayment', TypepaymentSchema);