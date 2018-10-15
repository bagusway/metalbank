var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatusTripSchema = new Schema({
    id_status: { type: String, },
    status_trip: { type: String, }
});

module.exports = mongoose.model('StatusTrip', StatusTripSchema);