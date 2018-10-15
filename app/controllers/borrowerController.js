var multer = require('multer');
var fs = require('fs');
var mongoose = require('mongoose');
var Borrower = require('../models/p2p/borrower');
var Gadai = require('../models/p2p/gadai');


var borrower = function(req, res) {
    Borrower.find({}, function(err, Allborrower) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({
                status: 200,
                message: "succes get all borrower",
                data:Allborrower
            });
        }
    })
}
var addGadai = function (req, res) {
    var gadai = new Gadai();

    gadai.borrower_id   = req.body.borrower_id;
    gadai.gram          = req.body.gram;
    gadai.qty           = req.body.qty;
    gadai.price         = req.body.price;
    gadai.period        = req.body.period;
    gadai.laba          = req.body.laba/100;
    gadai.ltv           = req.body.ltv/100;
    gadai.all_qty       = gadai.gram*gadai.qty;
    gadai.total_price   = gadai.price*gadai.all_qty;
    gadai.dp            = 1-gadai.ltv;
    gadai.dp_price      = gadai.dp*gadai.total_price;
    gadai.laep          = gadai.ltv+0.1;
    gadai.loans         = gadai.total_price*gadai.ltv;
    gadai.installment   = gadai.loans*gadai.ltv/gadai.period;
    gadai.return        = (gadai.laba*gadai.total_price)/gadai.period;
    


    
    if (gadai.borrower_id=='') {
        res.status(400).send(err)
    }
    else{
    gadai.save(function(err){
        if (err) {
            res.status(500).send(err);
        }
        else{
            res.json({ status: 200, message: 'gadai succes',data:gadai });
        }
    });    
    }
    
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
	borrower:borrower,
    addGadai:addGadai,
    getAllGadai:getAllGadai,
    getGadaibyid:getGadaibyid
}