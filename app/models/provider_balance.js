var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/backendtravinesia");

autoIncrement.initialize(connection);

var ProviderbalanceSchema = new Schema({
    id_provider_balance: { type: String },
    id_provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider'
    },
    id_trip: {
        type: Schema.Types.ObjectId,
        ref: 'Trip'
    },
    id_booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    },
    fixed_payment: { type: Number },
    quantity: { type: Number },
    total_payment: { type: Number },
    no_booking_payment: { type: String },
    flag_payment: { type: Number, default: 1 },
    balance_history: { type: Number }
})

ProviderbalanceSchema.plugin(autoIncrement.plugin, { model: 'Providerbalance', field: 'id_provider_balance', startAt: 1 });

module.exports = mongoose.model('Providerbalance', ProviderbalanceSchema);