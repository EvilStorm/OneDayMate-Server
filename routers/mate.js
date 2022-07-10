var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var auth = require('../components/auth');
var ModelMate = require('../models/model_mate');
var TagHandler = require('./components/tag_handler');
var ModelUser = require('../models/model_user');
var ModelMateMyHistory = require('../models/model_mate_my_history');
var ModelMateMember = require('../models/model_mate_member');
var { getMateDetail, getMateBerif, getMateByTag} = require('./components/find_mate');
var DBConst = require('../db/constant');
var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');

var MateAggr = require('./components/aggr_mate');

var FCMCreator = require('../components/fcm/fcm_message_creator');
var FCMSender = require('../components/fcm/fcm_sender');




router.post("", auth.isSignIn, (req, res) => {
    console.log(req.body);

    var data = req.body;
    const tags = [...req.body.tags];

    data.owner = req.decoded.id
    data.tags = [];

    ModelMate(data)
    .save()
    .then(async (_) => {
        var history = await ModelMateMyHistory.findOne({owner: req.decoded.id});
        history.created.unshift(_._id);
        await history.save()
        
        var mateJoin = await ModelMateMember(
            {
                owner: req.decoded.id,
                mate: _.id,
                appliedMember: [req.decoded.id],
                acceptedMember: [req.decoded.id],
                deniedMember: [],
            }
        ).save();
        _.member = mateJoin._id;
        await _.save();

        await TagHandler.postTagsMate(_._id, _.owner, tags)
        const resposeData = await getMateDetail(_._id)

        res.json(response.success(resposeData))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get("/detail/:mateId", (req, res) => {
    getMateDetail(req.params.mateId)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        console.log(_);
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/brief/:mateId", (req, res) => {
    getMateBerif(req.params.mateId)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        console.log(_);
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/latest/:count", auth.signCondition, (req, res) => {
    
    MateAggr.getMateBrief(
        req.decoded.id,  
        {
            $and: [
                {isShow: true},
                {mateDate: {$gte: new Date()}}
            ]
        },
        0,
        parseInt(req.params.count)
    )
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        console.log(_);
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get("/search/tag/:tag/:page", auth.signCondition, (req, res) => {
    var searchWords = req.params.tag.split(',');

    MateAggr.getMateBrief(
        req.decoded.id,  
        {
            $and: [
                {isShow: true},
                {"tags.tag": {$in: searchWords}},
                {mateDate: {$gte: new Date()}}
            ]
        },
        req.params.page,
        DBConst.PAGE_COUNT,
        {
            mateDate: 1
        }   
    )
    .then(_ => {
        res.json(response.success(_));
    })
    .catch((_) => {
        console.log(_);
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get("/search/tag/:tag", (req, res) => {
    getMateByTag(req.params.tag)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        console.log(_);
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});




router.patch("/:_id", auth.isAdmin, (req, res) => {
    ModelMate.findByIdAndUpdate({_id: req.params._id}, {$set: req.body})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.delete("/:_id", auth.isAdmin, (req, res) => {
    ModelMate.findByIdAndDelete(req.params._id)
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

module.exports = router;