var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var auth = require('../components/auth');
var ModelMate = require('../models/model_mate');
var TagHandler = require('./components/tag_handler');
var ModelUser = require('../models/model_user');
var ModelMateMyHistory = require('../models/model_mate_my_history');
var ModelMateMember = require('../models/model_mate_member');
var { getMateDetail, getMateBerif, getMateByTag } = require('./components/find_mate');
var DBConst = require('../db/constant');
var response = require('../components/response/response_util');
var { ResponseCode } = require('../components/response/response_code_store');
var { ExceptionType, createException, convertException } = require('../components/exception/exception_creator');

var MateAggr = require('./components/aggr_mate');

var FCMCreator = require('../components/fcm/fcm_message_creator');
var FCMSender = require('../components/fcm/fcm_sender');

router.post('', auth.isSignIn, (req, res) => {
  console.log(req.body);

  var data = req.body;
  const tags = [...req.body.tags];

  data.owner = req.decoded.id;
  data.tags = [];

  ModelMate(data)
    .save()
    .then(async (_) => {
      var history = await ModelMateMyHistory.findOne({ owner: req.decoded.id });
      history.created.unshift(_._id);
      await history.save();

      var mateJoin = await ModelMateMember({
        owner: req.decoded.id,
        mate: _.id,
        appliedMember: [req.decoded.id],
        acceptedMember: [req.decoded.id],
        deniedMember: [],
      }).save();
      _.member = mateJoin._id;
      await _.save();

      await TagHandler.postTagsMate(_._id, _.owner, tags);
      const resposeData = await getMateDetail(_._id);

      res.json(response.success(resposeData));
    })
    .catch((_) => {
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

/**
 * 참가 신청
 */
router.post('/apply/:mateId', auth.isSignIn, async (req, res) => {
  console.log(`req.decoded.id: ${req.decoded.id}`);
  //맴버맵에 지원자 추가하기
  var joinMate = await ModelMateMember.findOne({ mate: req.params.mateId });
  joinMate.appliedMember.push(req.decoded.id);
  joinMate
    .save()
    .then(async (_) => {
      console.log(`ID: ${req.decoded.id}`);
      //메이트에 지원원 원료시 내 메이트 히스토리에 지원으로 등록한다.
      var history = await ModelMateMyHistory.findOne({ owner: mongoose.Types.ObjectId(req.decoded.id) });
      history.applied.unshift(req.params.mateId);
      await history.save();

      //지원한 메이트 주인에게 지원자가 있다는 알림을 발송한다.
      var owner = await ModelUser.findById(_.owner).populate('setting');

      if (owner.setting.mateJoinAlarm) {
        var message = await FCMCreator.createMessage(_.owner, FCMCreator.MessageType.APPLIED);
        FCMSender.sendPush(message);
      }

      res.json(response.success(_));
    })
    .catch((_) => {
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

/**
 * 참가 신청취소(참가 신청자가 취소)
 */
router.post('/apply/cancel/:mateId', auth.isSignIn, async (req, res) => {
  //신청자 히스토리에 등록한 지원을 삭제한다.
  var history = await ModelMateMyHistory.findOne({ owner: req.decoded.id });
  const historyIndex = history.applied.indexOf(req.params.mateId);
  if (historyIndex > -1) {
    history.applied.splice(historyIndex, 1);
  }
  await history.save();

  //지원 한 메이트에 지원을 삭제한다.
  var joinMate = await ModelMateMember.findOne({ mate: req.params.mateId });

  const index = joinMate.appliedMember.indexOf(req.decoded.id);
  if (index > -1) {
    joinMate.appliedMember.splice(index, 1);
  }

  //이미 참가 승인이 난 경우
  const accpetedIndex = joinMate.acceptedMember.indexOf(req.decoded.id);
  if (accpetedIndex > -1) {
    joinMate.acceptedMember.splice(accpetedIndex, 1);
  }

  //지원한 메이트 주인에게 지원자가 지원 취소했다는 알림을 발송한다.
  var owner = await ModelUser.findById(joinMate.owner).populate('setting');

  if (owner.setting.mateJoinAlarm) {
    var message = await FCMCreator.createMessage(joinMate.owner, FCMCreator.MessageType.APPLY_CANCEL);
    FCMSender.sendPush(message);
  }

  joinMate
    .save()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

/**
 * 메이트 참가 허락
 */
router.post('/accept/:mateId', auth.isSignIn, async (req, res) => {
  const memberId = req.body.joinMemberId;
  var joinMate = await ModelMateMember.findOne({ mate: req.params.mateId });
  joinMate.acceptedMember.push(memberId);

  joinMate
    .save()
    .then(async (_) => {
      var history = await ModelMateMyHistory.findOne({ owner: memberId });
      console.log(history);
      history.accepted.unshift(req.params.mateId);
      await history.save();

      //지원한 메이트에게 승인되었다는 푸쉬를 보낸다.
      var owner = await ModelUser.findById(memberId).populate('setting');

      if (owner.setting.mateJoinAlarm) {
        var message = await FCMCreator.createMessage(memberId, FCMCreator.MessageType.ACCEPT);
        FCMSender.sendPush(message);
      }

      res.json(response.success(_));
    })
    .catch((_) => {
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

/**
 * 매이트 참가 취소(메이트 주인이 취소)
 */
router.post('/accept/cancel/:mateId', auth.isSignIn, async (req, res) => {
  try {
    var mateJoin = await ModelMateMember.findOne({ mate: req.params.mateId });
    var index = mateJoin.acceptedMember.indexOf(req.body.userId);
    mateJoin.acceptedMember.splice(index, 1);
    await mateJoin.save();

    var history = await ModelMateMyHistory.findOne({ owner: req.body.userId });
    var index2 = history.accepted.indexOf(req.params.mateId);
    history.accepted.splice(index2, 1);
    await history.save();

    //지원한 메이트에게 승인 거절되었다는 메시지를 보낸다..
    var owner = await ModelUser.findById(req.body.userId).populate('setting');

    if (owner.setting.mateJoinAlarm) {
      var message = await FCMCreator.createMessage(req.body.userId, FCMCreator.MessageType.DENIED);
      FCMSender.sendPush(message);
    }

    res.json(response.success({ result: 1 }));
  } catch (e) {
    var error = convertException(e);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

router.patch('/like', auth.isSignIn, async (req, res) => {
  try {
    var mate = await ModelMate.findById(req.body.mateId);
    var history = await ModelMateMyHistory.findOne({ owner: req.decoded.id });

    var index = mate.like.indexOf(req.decoded.id);

    var resultValue = false;

    if (index == -1) {
      mate.like.push(req.decoded.id);
      history.liked.push(req.body.mateId);
      resultValue = true;
    } else {
      mate.like.splice(index, 1);

      const historyIndex = history.liked.indexOf(req.body.mateId);
      history.liked.splice(historyIndex, 1);
    }

    await history.save();
    await mate.save();
    res.json(response.success({ result: 1, value: resultValue }));
  } catch (e) {
    console.log(e);
    var error = convertException(e);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

router.get('/detail/:mateId', (req, res) => {
  getMateDetail(req.params.mateId)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
      console.log(_);
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

router.get('/brief/:mateId', (req, res) => {
  getMateBerif(req.params.mateId)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
      console.log(_);
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

router.get('/latest/:count', auth.signCondition, (req, res) => {
  MateAggr.getMateBrief(
    req.decoded.id,
    {
      $and: [{ isShow: true }, { mateDate: { $gte: new Date() } }],
    },
    0,
    parseInt(req.params.count)
  )
    .then((_) => {
      res.json(response.success(_));
    })
    .catch((_) => {
      console.log(_);
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

router.get('/search/tag/:tag/:page', auth.signCondition, (req, res) => {
  var searchWords = req.params.tag.split(',');

  MateAggr.getMateBrief(
    req.decoded.id,
    {
      $and: [{ isShow: true }, { 'tags.tag': { $in: searchWords } }, { mateDate: { $gte: new Date() } }],
    },
    req.params.page,
    DBConst.PAGE_COUNT,
    {
      mateDate: 1,
    }
  )
    .then((_) => {
      res.json(response.success(_));
    })
    .catch((_) => {
      console.log(_);
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

router.get('/search/tag/:tag', (req, res) => {
  getMateByTag(req.params.tag)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
      console.log(_);
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

router.patch('/:_id', auth.isAdmin, (req, res) => {
  console.log(' PATCH !!! 1111111');
  ModelMate.findByIdAndUpdate({ _id: req.params._id }, { $set: req.body })
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

router.delete('/:_id', auth.isAdmin, (req, res) => {
  ModelMate.findByIdAndDelete(req.params._id)
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
      var error = convertException(_);
      res.json(response.fail(error, error.errmsg, error.code));
    });
});

module.exports = router;
