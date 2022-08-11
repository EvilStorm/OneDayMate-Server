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
const { compareDocumentPosition } = require('domutils');

router.post('', auth.isSignIn, async (req, res) => {
  console.log(req.body);

  try {
    let data = req.body;
    const tags = [...req.body.tags];

    data.owner = req.decoded.id;
    data.tags = [];

    let mate = await ModelMate(data);
    var history = await ModelMateMyHistory.findOne({ owner: req.decoded.id });
    history.created.unshift(mate._id);
    await history.save();

    var mateJoin = await ModelMateMember({
      owner: req.decoded.id,
      mate: mate.id,
      appliedMember: [req.decoded.id],
      acceptedMember: [req.decoded.id],
      deniedMember: [],
    }).save();
    mate.member = mateJoin._id;
    await mate.save();

    await TagHandler.postTagsMate(mate._id, mate.owner, tags);
    const resposeData = await getMateDetail(mate._id);

    res.json(response.success(resposeData));
  } catch (e) {
    var error = convertException(_);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

/**
 * 참가 신청
 */
router.post('/apply/:mateId', auth.isSignIn, async (req, res) => {
  console.log(`req.decoded.id: ${req.decoded.id}`);
  try {
    var joinMate = await ModelMateMember.findOne({ mate: req.params.mateId });
    joinMate.appliedMember.push(req.decoded.id);
    let mateResult = await joinMate.save();

    var history = await ModelMateMyHistory.findOne({ owner: mongoose.Types.ObjectId(req.decoded.id) });
    history.applied.unshift(req.params.mateId);
    await history.save();

    //지원한 메이트 주인에게 지원자가 있다는 알림을 발송한다.
    var owner = await ModelUser.findById(mateResult.owner).populate('setting');

    if (owner.setting.mateJoinAlarm) {
      var message = await FCMCreator.createMessage(mateResult.owner, FCMCreator.MessageType.APPLIED);
      FCMSender.sendPush(message);
    }
    const result = await getBriefSigleMateByMateId(req.decoded.id, req.params.mateId);
    res.json(response.success(result));
    // const result = await getMateBerif(req.params.mateId);
    // res.json(response.success(result));
  } catch (e) {
    var error = convertException(e);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

/**
 * 참가 신청취소(참가 신청자가 취소)
 */
router.post('/apply/cancel/:mateId', auth.isSignIn, async (req, res) => {
  try {
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

    await joinMate.save();

    // const result = await getMateBerif(req.params.mateId);
    // res.json(response.success(result));
    const result = await getBriefSigleMateByMateId(req.decoded.id, req.params.mateId);
    res.json(response.success(result));
  } catch (e) {
    console.log(e);
    var error = convertException(_);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

/**
 * 메이트 참가 허락
 */
router.post('/accept/:mateId', auth.isSignIn, async (req, res) => {
  try {
    //ModelMateMember: 메이트에 신청한 맴버리스트
    const memberId = req.body.userId;
    var joinMate = await ModelMateMember.findOne({ mate: req.params.mateId });
    joinMate.acceptedMember.push(memberId);
    const insert = await joinMate.save();

    //ModelMateMyHistory: 내가 그동안 메이트에 신청, 승인 등의 기록
    var history = await ModelMateMyHistory.findOne({ owner: memberId });
    // console.log(history);
    history.accepted.unshift(req.params.mateId);
    await history.save();

    //지원한 메이트에게 승인되었다는 푸쉬를 보낸다.
    var owner = await ModelUser.findById(memberId).populate('setting');

    if (owner.setting.mateJoinAlarm) {
      var message = await FCMCreator.createMessage(memberId, FCMCreator.MessageType.ACCEPT);
      FCMSender.sendPush(message);
    }

    const result = await getBriefSigleMateByMateId(req.decoded.id, req.params.mateId);
    res.json(response.success(result));

    // const result = await getMateBerif(req.params.mateId);
    // res.json(response.success(result));
  } catch (e) {
    var error = convertException(e);
    res.json(response.fail(error, error.errmsg, error.code));
  }
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

    const result = await getBriefSigleMateByMateId(req.decoded.id, req.params.mateId);
    res.json(response.success(result));

    // const result = await getMateBerif(req.params.mateId);
    // res.json(response.success(result));
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

    const result = await getBriefSigleMateByMateId(req.decoded.id, req.body.mateId);
    res.json(response.success(result));
  } catch (e) {
    console.log(e);
    var error = convertException(e);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

router.get('/detail/:mateId', auth.signCondition, async (req, res) => {
  try {
    var result = await MateAggr.getMateDetail(req.decoded.id, {
      $and: [{ _id: mongoose.Types.ObjectId(req.params.mateId) }, { isShow: true }],
    });

    // console.log(result);
    res.json(response.success(result));
  } catch (e) {
    console.log(e);
    var error = convertException(e);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

async function getBriefSigleMateByMateId(userId, mateId) {
  return new Promise((resolve, reject) => {
    MateAggr.getMateBrief(userId, {
      _id: mongoose.Types.ObjectId(mateId),
    })
      .then((_) => resolve(_[0]))
      .catch((_) => {
        reject(_);
      });
  });
}

async function getBriefSigleMateByMateIdList(userId, mateIds) {
  return new Promise((resolve, reject) => {
    MateAggr.getMateBrief(userId, {
      _id: {
        $in: mateIds,
      },
    })
      .then((_) => resolve(_))
      .catch((_) => {
        reject(_);
      });
  });
}

router.get('/brief/:mateId', auth.signCondition, async (req, res) => {
  try {
    const result = await getBriefSigleMateByMateId(req.decoded.id, req.params.mateId);
    res.json(response.success(result));
  } catch (e) {
    var error = convertException(_);
    res.json(response.fail(error, error.errmsg, error.code));
  }

  // getMateBerif(req.params.mateId)
  //   .then((_) => res.json(response.success(_)))
  //   .catch((_) => {
  //     console.log(_);
  //     var error = convertException(_);
  //     res.json(response.fail(error, error.errmsg, error.code));
  //   });
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

router.get('/me/created/:page', auth.isSignIn, async (req, res) => {
  try {
    const page = Number(req.params.page);

    const myHistory = await ModelMateMyHistory.findOne({
      owner: req.decoded.id,
    }).exec();

    const list = myHistory.created.slice(DBConst.PAGE_COUNT * page, DBConst.PAGE_COUNT * (page + 1));

    const result = await getBriefSigleMateByMateIdList(req.decoded.id, list);
    res.json(response.success(result));
  } catch (e) {
    var error = convertException(_);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

router.get('/me/liked/:page', auth.isSignIn, async (req, res) => {
  try {
    const page = Number(req.params.page);

    const myHistory = await ModelMateMyHistory.findOne({
      owner: req.decoded.id,
    }).exec();

    const list = myHistory.liked.slice(DBConst.PAGE_COUNT * page, DBConst.PAGE_COUNT * (page + 1));

    const result = await getBriefSigleMateByMateIdList(req.decoded.id, list);
    res.json(response.success(result));
  } catch (e) {
    var error = convertException(_);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

router.get('/me/applied/:page', auth.isSignIn, async (req, res) => {
  try {
    const page = Number(req.params.page);

    const myHistory = await ModelMateMyHistory.findOne({
      owner: req.decoded.id,
    }).exec();

    const list = myHistory.applied.slice(DBConst.PAGE_COUNT * page, DBConst.PAGE_COUNT * (page + 1));

    const result = await getBriefSigleMateByMateIdList(req.decoded.id, list);
    res.json(response.success(result));
  } catch (e) {
    var error = convertException(_);
    res.json(response.fail(error, error.errmsg, error.code));
  }
});

router.get('/me/accepted/:page', auth.isSignIn, async (req, res) => {
  try {
    const page = Number(req.params.page);

    const myHistory = await ModelMateMyHistory.findOne({
      owner: req.decoded.id,
    }).exec();

    const list = myHistory.accepted.slice(DBConst.PAGE_COUNT * page, DBConst.PAGE_COUNT * (page + 1));

    const result = await getBriefSigleMateByMateIdList(req.decoded.id, list);
    res.json(response.success(result));
  } catch (e) {
    var error = convertException(_);
    res.json(response.fail(error, error.errmsg, error.code));
  }
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

router.patch('/:_id', auth.isSignIn, async (req, res) => {
  try {
    await ModelMate.findByIdAndUpdate({ _id: req.params._id }, { $set: req.body });

    const result = await getBriefSigleMateByMateId(req.decoded.id, req.params._id);
    res.json(response.success(result));
  } catch (e) {
    var error = convertException(_);
    res.json(response.fail(error, error.errmsg, error.code));
  }
  // console.log(' PATCH !!! 1111111');
  // ModelMate.findByIdAndUpdate({ _id: req.params._id }, { $set: req.body })
  //   .exec()
  //   .then((_) => res.json(response.success(_)))
  //   .catch((_) => {
  //     var error = convertException(_);
  //     res.json(response.fail(error, error.errmsg, error.code));
  //   });
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
