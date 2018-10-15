var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookingexpireSchema = new Schema({
    createdAt: { type: Date, default: Date.now, expires: '1m' },
    booking_expire: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    }
});

module.exports = mongoose.model('Bookingexpire', BookingexpireSchema);