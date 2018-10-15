var multer = require('multer');
var fs = require('fs');
var mongoose = require('mongoose');
var Borrower = require('../models/p2p/borrower');
var Gadai = require('../models/p2p/gadai');
var Lender = require('../models/p2p/lender');

var lender = function(req, res) {
    Lender.find({}, function(err, Alllender) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all lender",
                data:Allborrower
            });
        }
    })
}

var getAllGadai = function(req,res){
    Gadai.find({},function (err, AllGadai) {
     if (err) {
        res.json({ status: 402, message: err, data: "" });
     }
     else{
        res.json({
                status: 200,
                message: "succes get all gadai",
                data:AllGadai});
     }
    });
}
var getGadaibyid = function(req,res){
    Gadai.find({'gadai_id':req.params.gadai_id}, function(err, gadai) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get gadai",
                data: gadai});
        }
    });

}


    


module.exports = {
	lender:lender,
    getAllGadai:getAllGadai,
    getGadaibyid:getGadaibyid
}