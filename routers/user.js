var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var ModelUser = require('../models/model_user');
var auth = require('../components/auth');
var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');

router.get('/me', auth.isSignIn, async function(req, res) {

    try {

        var result = await ModelUser.findOne({
            _id: mongoose.Types.ObjectId(req.decoded.id),
        })
        .populate('setting')
        res.json(response.success(result));

    } catch (err) {
        var error = convertException(err)
        res.json(response.fail(error, error.errmsg, error.code))
    }
});


router.get('/detail/me', auth.isSignIn, async function(req, res) {

    try {

        var result = await ModelUser.findOne({
            _id: mongoose.Types.ObjectId(req.decoded.id),
        })
        .populate('setting')
        res.json(response.success(result));

    } catch (err) {
        var error = convertException(err)
        res.json(response.fail(error, error.errmsg, error.code))
    }
});



router.get('/check/nickName/:nickName',  async function(req, res) {

    try {

        var result = await ModelUser.findOne({
            nickName: req.params.nickName,
        })
    
        if(result == null) {
            res.json(response.success({result: 1, message: '사용할 수 있습니다.'}));
        } else {
            res.json(response.success({result: 0, message: '이미 사중입니다.'}));
        }

    } catch (err) {
        var error = convertException(err)
        res.json(response.fail(error, error.errmsg, error.code))
    }
});


router.get("/find/identifyId/:identifyId", auth.isAdmin, (req, res) => {
    ModelUser.findOne({identifyId: req.params.identifyId})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});



router.patch("/", auth.isSignIn, (req, res) => {
    ModelUser.findByIdAndUpdate({_id: req.decoded.id}, {$set: req.body})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


module.exports = router;
