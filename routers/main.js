var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var response = require('../components/response/response_util');
var { ResponseCode } = require('../components/response/response_code_store');
var { ExceptionType, createException, convertException } = require('../components/exception/exception_creator');

var auth = require('../components/auth');
var ModelUser = require('../models/model_user');
var ModelMate = require('../models/model_mate');

var MateAggr = require('./components/aggr_mate');
var { getMateBerif, getMateBriefWithCondition } = require('./components/find_mate');

router.get('', auth.isSignIn, async (req, res) => {
  const user = await ModelUser.findById(req.decoded.id);

  // getMateBriefWithCondition(req.params.mateId, 0, 10)
  //   .then((_) => res.json(response.success(_)))
  //   .catch((_) => {
  //     console.log(_);
  //     var error = convertException(_);
  //     res.json(response.fail(error, error.errmsg, error.code));
  //   });

  console.log(`req.decoded.id,: ${req.decoded.id}`);
  MateAggr.getMateBrief(
    req.decoded.id,
    {
      $and: [
        { isShow: true },
        // { mateDate: { $gte: new Date() } }
      ],
    },
    0,
    parseInt(10)
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

module.exports = router;
