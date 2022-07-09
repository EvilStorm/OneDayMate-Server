var express = require('express');
var router = express.Router();
var util = require('../components/response/response_util');
var ModelNotify = require('../models/model_notify');
var ModelTerm = require('../models/model_term');
var ModelAppUpdate = require('../models/model_app_version');

router.get("/splash/:appSeq/:notiSeq/:termSeq", async (req, res) => {
    let notifyResult;
    let termResult;
    let updateResult;
    await getMainNotify(req.params.notiSeq, (data) => {
        notifyResult = data;
    });
    await getAgree(req.params.termSeq, (data) =>{
        termResult = data;
    });
    await getAppUpdate(req.params.appSeq, (data) =>{
        if(Array.isArray(data)) {
            if(data.length == 0) {
                updateResult = null;     
            } else {
                updateResult = data[0];
            }
         } else {
            updateResult = data;
         }
    });

    result = new Object();
    result.notify = notifyResult;
    result.term = termResult;
    result.update = updateResult;

    res.send(util.success(result));
})


async function getMainNotify(version, callback) {
    callback(
        await ModelNotify.where({$and:[{seq: {$gt: version}}, {$or: [{appStop:true}, {important:true}]}, {show: true}]})
            .sort({seq: -1})
            .exec()
    );
}

async function getAgree(seq, callback){
    callback(
        await ModelTerm.findOne({release: true})
        .where('seq').gt(seq)
        .sort({'version': -1})
        .exec()
    );    
};

async function getAppUpdate(seq, callback) {
    callback(await ModelAppUpdate.aggregate([
        {
            $match: {
                $and: [{
                    appVer: {$gt: Number(seq)}
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
    ]).exec()
    );
    
};

module.exports = router;