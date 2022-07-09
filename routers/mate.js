var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var auth = require('../components/auth');
var ModelMate = require('../models/model_mate');
var TagHandler = require('./components/tag_handler');
var ModelUser = require('../models/model_user');
var ModelMateMyHistory = require('../models/model_mate_my_history');
var ModelMateMember = require('../models/model_mate_member');
var DBConst = require('../db/constant');
var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');


var FCMCreator = require('../components/fcm/fcm_message_creator');
var FCMSender = require('../components/fcm/fcm_sender');


const userBriefSelect = "_id nickName pictureMe";
const matePopulate = [
    {
        path: 'member',
        select: 'member',
        populate: [
            {
                path: 'member',
                select: userBriefSelect
            },
            {
                path: 'joinMember',
                select: userBriefSelect
            },
            {
                path: 'deniedMember',
                select: userBriefSelect
            }

        ]
    },
    {
        path: 'owner',
        select: userBriefSelect
    },

    {
        path: 'tags'
    },

];

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

        var user = await ModelUser.findById(req.decoded.id);
        user.mate.unshift(_._id);
        await user.save();
        
        var mateJoin = await ModelMateMember(
            {
                owner: req.decoded.id,
                mate: _.id,
                appliedMember: [req.decoded.id],
                joinMember: [req.decoded.id],
                deniedMember: [],
            }
        ).save();

        var mate = await ModelMate.findById(_._id);
        mate.member = mateJoin._id;
        
        await mate.save();

        await TagHandler.postTagsMate(_._id, _.owner, tags)
        const resposeData = await getMateDetail(_._id)

        res.json(response.success(resposeData))
    })
    .catch((_) => {
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