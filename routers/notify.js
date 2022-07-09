var express = require('express');
var router = express.Router();

var ModelNotify = require('../models/model_notify');
var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');

const PAGE_COUNT = 50;

router.post("", (req, res) => {
    
    ModelNotify.findOne({})
    .sort({seq: -1})
    .exec()
    .then((notify) => {
        let count = 0;
        if(notify != null) {
            count = notify.seq;
        }
        const content = new ModelNotify(req.body);
        content.seq = count+1;
        content.save()
        .then((_) =>{
            res.json(response.success(_))
        })
        .catch((_) => {
            var error = convertException(_)
            res.json(response.fail(error, error.errmsg, error.code))
        });
    
    })
    .catch((err) => res.json(response.successFalse(err)));

});

router.get("/", (req, res) => {
    current = new Date()
    // current.setMonth(current.getMonth() - 3);
    // ModelNotify.where({createdAt: {$gt: current}})
    ModelNotify.where()
    .sort({seq: -1})
    .exec()
    .then((_) => {
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/:seq", (req, res) => {

    ModelNotify.where({
        $and:[
            {show:true},{seq: Number(req.params.seq)}
        ]
    })
    .exec()
    .then((_) => {
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});
router.get("/page/:page", (req, res) => {

    ModelNotify.where({show: true})
    .sort({createdAt: -1})
    .skip(PAGE_COUNT * req.params.page)
    .limit(PAGE_COUNT)
    .exec()
    .then((_) => {
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.get("/count/:count", (req, res) => {

    ModelNotify.where({show: true})
    .sort({createdAt: -1})
    .limit(parseInt(req.params.count))
    .then((_) => {
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});


router.get("/main/:seq", (req, res) => {

    ModelNotify.where({$and:[{seq: {$gt: req.params.seq}}, {$or: [{appStop:true}, {important:true}]}, {show: true}]})
    .sort({createdAt: -1})
    .exec()
    .then((_) => {
        res.json(response.success(_))
    })
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))

    });
});


router.patch("/:_id", (req, res) => {
    ModelNotify.findOneAndUpdate({_id: req.params._id}, {$set: req.body})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
     
});

router.delete("/:_id", (req, res) => {
    ModelNotify.findOneAndUpdate({_id: req.params._id}, {$set: {show: false}})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });

    // ModelNotify.findOneAndDelete({_id: req.params._id})
    // .exec()
    // .then((_) => res.json(response.success(_)))
    // .catch((_) => {
    //     var error = convertException(_)
    //     res.json(response.fail(error, error.errmsg, error.code))
    // })
     
});




module.exports = router;