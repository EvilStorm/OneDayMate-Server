var express = require('express');
var router = express.Router();

var ModelAppVersion = require('../models/model_app_version');
var response = require('../components/response/response_util');

var auth = require('../components/auth');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');


router.post("", auth.isAdmin, (req, res) => {
    const content = new ModelAppVersion(req.body);
    content.save()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/", auth.isAdmin, (req, res) => {
    ModelAppVersion.find().sort({appVer: 1})
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    })
});

router.get("/:ver", (req, res) => {
    ModelAppVersion.aggregate([
        {
            $match: {
                $and: [{
                    appVer: Number(req.params.ver)
                }, {isShow: true}]   
            }
        }
    ])
    .then((_) => {
        res.json(response.success(_))
    }
    )
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/after/:ver", (req, res) => {
    ModelAppVersion.aggregate([
        {
            $match: {
                $and: [{
                    appVer: {$gt: Number(req.params.ver)}
                }, {isShow: true}]   
            }
        },
        {
            $group: {
                _id:null,
                appVer: {$max: "$appVer"},
                say: {$last: "$say"},
                isMustUpdate: {$max: "$isMustUpdate"},
            }
        },
    ])
    .then((_) => {
        res.json(response.success(_))
    }
    )
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});



router.patch("/:_id", auth.isAdmin, (req, res) => {
    ModelAppVersion.findByIdAndUpdate(req.params._id, {$set: req.body})
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    })
});

router.delete("/:_id", auth.isAdmin, (req, res) => {
    ModelAppVersion.findByIdAndDelete(req.params._id)
    .then(_ => res.json(response.success(_)))
    .catch( _ => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
})



module.exports = router;