var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FacilitySchema = new Schema({
    id_facility: { type: String, },
    facility_name: { type: String, }
});

module.exports = mongoose.model('Facilitytrip', FacilitySchema);