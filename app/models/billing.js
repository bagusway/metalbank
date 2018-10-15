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

var BillingSchema = new Schema({
     id_billing: { type: String },
    // id_user:{type: String},
    // name: { type: String },
    // id_trip: {type: String},
    // trip_name:{type:String},
    id_booking:{type:String},
    TRANSACTIONTYPE:{type: String, default:1},
    RESPONSE_TYPE:{type: String, default:2},
    LANG:{type: String},
    MERCHANTID:{type: String},
    PAYMENT_METHOD:{type: String},
	TXN_PASSWORD:{type: String},
	MERCHANT_TRANID:{type: Date, default:Date.now},
	CURRENCYCODE:{type: String, default:'IDR'},
	AMOUNT:{type: String, default:1000},
	CUSTNAME:{type: String},
	CUSTEMAIL:{type: String},
	DESCRIPT_ION:{type: String,default:'transaski test'},
	RETURN_URL:{type: String},
	SIGNATURE:{type: String},
	BILLING_ADDRESS:{type: String},
	BILLING_ADDRESS_CITY:{type: String},
	BILLING_ADDRESS_REGION:{type: String},
	BILLING_ADDRESS_STATE:{type: String},
	BILLING_ADDRESS_POSCODE:{type: String},
	BILLING_ADDRESS_COUNTRY_CODE:{type: String},
	RECEIVER_NAME_FOR_SHIPPING:{type: String, default:'ega'},
	SHIPPING_ADDRESS:{type: String,default:'pintu air raya'},
	SHIPPING_ADDRESS_CITY:{type: String,default:'Jakarta pusat'},
	SHIPPING_ADDRESS_REGION:{type: String,default:'Jakarta pusat'},
	SHIPPING_ADDRESS_STATE:{type: String,default:'Jakarta pusat'},
	SHIPPING_ADDRESS_POSCODE:{type: String,default:'Jakarta pusat'},
	SHIPPING_ADDRESS_COUNTRY_CODE:{type: String,default:'Jakarta pusat'},
	SHIPPINGCOST:{type: String,default:0},
	PHONE_NO:{type: Number,default:0897867688989},
	MREF1:{type: String,default:'tes'},
	MREF2:{type: String,default:'bossss'},
	MREF3:{type: String,default:'Tas;2;3000000'},
	MREF4:{type: String}, 
	MREF5:{type: String},
	MREF6:{type: String},
	MREF7:{type: String},
	MREF8:{type: String},
	MREF9:{type: String},
	MREF10:{type: String},
	MPARAM1:{type: String},
	MPARAM2:{type: String,default:'Testing'}

});
BillingSchema.plugin(autoIncrement.plugin, {model: 'Billing', field: 'id_billing', startAt: 1});
module.exports = mongoose.model('Billing', BillingSchema);