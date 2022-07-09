var express = require('express');
var router = express.Router();

var ModelTerm = require('../models/model_term');
var auth = require('../components/auth');
var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');

router.get("/last", (req, res) => {

    ModelTerm.findOne({release: true})
    .sort({seq: -1})
    .limit(1)
    .exec()
    .then((_) => {
        if(_ == null) {
            res.json(response.success({message: '업데이트 된 약관이 없습니다.'}, ResponseCode.SUCCESS.EMPTY))
            return
        } 
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/:seq", (req, res) => {

    ModelTerm.findOne({
        $and:[
            {release: true},
            {seq: Number(req.params.seq)}
        ]
    })
    .sort({seq: -1})
    .exec()
    .then((_) => {
        if(_ == null) {
            res.json(response.success({message: '업데이트 된 약관이 없습니다.'}, ResponseCode.SUCCESS.EMPTY))
            return
        } 
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get("/after/:seq", (req, res) => {

    ModelTerm.findOne({$and:[
        {release: true},
        {seq: {$gt: Number(req.params.seq)}}
    ]
    })
    .sort({seq: -1})
    .exec()
    .then((_) => {
        if(_ == null) {
            res.json(response.success({message: '업데이트 된 약관이 없습니다.'}, ResponseCode.SUCCESS.EMPTY))
            return
        } 
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});



router.post("", auth.isAdmin, (req, res) => {
    ModelTerm.countDocuments()
    .exec()
    .then((search) => {
        console.log(search)
        const agree = new ModelTerm(req.body);
        agree.seq = search+1;
        agree.save()
        .then((_) => res.json(response.success(_)))
        .catch((_) => {
            var error = convertException(_)
            res.json(response.fail(error, error.errmsg, error.code))
        });
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.patch("/:_id", auth.isAdmin, (req, res) => {
    ModelTerm.findByIdAndUpdate({_id: req.params._id}, {$set: req.body})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});
router.delete("/:_id", auth.isAdmin, (req, res) => {
    ModelTerm.findByIdAndDelete(req.params._id)
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

module.exports = router;