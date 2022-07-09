var express = require('express');
var router = express.Router();
var auth = require('../components/auth');

var ModelSetting = require('../models/model_setting');
var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');


router.get("/", auth.isSignIn, (req, res) => {
    ModelSetting.findOne({owner: req.decoded.id})
    .select('-owner')
    .exec()
    .then((cursor) => res.json(response.successTrue(cursor)))
    .catch((err) => res.json(response.successFalse(err)))
     
});


router.patch("/", auth.isSignIn, (req, res) => {
    ModelSetting.findOneAndUpdate({owner: req.decoded.id}, {$set: req.body})
    .exec()
    .then((cursor) => res.json(response.successTrue(cursor)))
    .catch((err) => res.json(response.successFalse(err)))
     
});

module.exports = router;