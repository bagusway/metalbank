var express             = require('express');
var borrowerController  = require('../controllers/borrowerController');
var borrowerController  = require('../controllers/lenderController');
var borrowerRouter      = express.Router();


borrowerRouter.route('/gadai')
	.post(borrowerController.addGadai);
borrowerRouter.route('/get')
    .get(borrowerController.borrower);
borrowerRouter.route('/getgadai')
	.get(borrowerController.getAllGadai);
borrowerRouter.route('/getgadai/:gadai_id')
	.get(borrowerController.getGadaibyid);


module.exports = borrowerRouter;
