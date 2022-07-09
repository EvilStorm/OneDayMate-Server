var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');

var ModelTag = require('../models/model_tag');
var ModelTagUseMap = require('../models/model_tag_use_map');
var auth = require('../components/auth');

const PAGE_COUNT = 30;

router.get("", (req, res) => {
    ModelTag.find()
    .sort({count: -1})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/all", (req, res) => {
    ModelTag.find()
    .sort({count: -1})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/hot", (req, res) => {
    ModelTag.find()
    .sort({count: -1})
    .limit(20)
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get("/:tag", (req, res) => {
    ModelTag.find({tag: req.params.tag})
    .sort({count: -1})
    .exec()
    .then((_) => {
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/search/:word", (req, res) => {
    ModelTag.find({tag: RegExp(req.params.word, "i")})
    .sort({count: -1})
    .exec()
    .then((cursor) => res.json(response.success(cursor)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/tagMap/detail", auth.isAdmin, (req, res) => {
    ModelTagUseMap.find()
    .populate('user')
    .populate('mate')
    .populate('tag')
    .sort({createdAt: -1})
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.post("/", auth.isSignIn, (req, res) => {
    const model = new ModelTag(req.body)
    model.save()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });

});


module.exports = router;
