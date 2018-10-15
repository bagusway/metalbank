var express = require('express');
var attributeController = require('../controllers/attributeController');
var attributeRouter = express.Router();

attributeRouter.route('/type/:id_type_trip')
    .get(attributeController.getType);

attributeRouter.route('/category/:category')
    .get(attributeController.getCategory);

attributeRouter.route('/province/:id_province')
    .get(attributeController.getProvince);

attributeRouter.route('/province')
    .get(attributeController.getAllProvince);

attributeRouter.route('/type')
    .get(attributeController.getAllType);

attributeRouter.route('/category')
    .get(attributeController.getAllCategory);

attributeRouter.route('/facility')
    .get(attributeController.getFacility);

attributeRouter.route('/trip')
    .get(attributeController.getAllTrip);

attributeRouter.route('/search/:category/:province')
    .get(attributeController.searchAllTrip);

attributeRouter.route('/trip/discussion/:id')
    .get(attributeController.getAllDiscussion);

attributeRouter.route('/trip/comment/:id')
    .get(attributeController.getAllCommentDiscussion);

attributeRouter.route('/type_payment')
    .get(attributeController.getTypepayment);

attributeRouter.route('/payment_method')
    .get(attributeController.getPaymentmethod);

attributeRouter.route('/status_payment')
    .get(attributeController.getStatuspayment);

attributeRouter.route('/job')
    .get(attributeController.getValidTrips);

attributeRouter.route('/detail_trip/:id_trip')
    .get(attributeController.getDetailTrip);

attributeRouter.route('/trip_detail/:id_trip')
    .get(attributeController.getDetailIDTrip);

attributeRouter.route('/trip/discount')
    .get(attributeController.getTripDiscount);

attributeRouter.route('/trip_name')
    .get(attributeController.getTripname);

attributeRouter.route('/search_trip/:trip_name')
    .get(attributeController.searchTripbyName);

attributeRouter.route('/search_category/:id_category')
    .get(attributeController.getTripbyCategory);

attributeRouter.route('/trip/name=:name&id_category:=id_category&days=:days&id_type=:id_type')
    .get(attributeController.searchAdvance);

module.exports = attributeRouter;