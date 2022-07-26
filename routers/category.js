var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var ModelCategory = require('../models/model_category');
var auth = require('../components/auth');
var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');

var category = [
    {
        category: '운동∙액티비티',
        type: 1,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Factivity.svg?alt=media&token=9ca9e8db-3143-4bbc-8a11-d962411d51d2',
    },
    {
        category: '직무∙스터디',
        type: 2,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fstudy.svg?alt=media&token=93efe3c9-0ad7-4f5b-831e-18e3cffaec69',
    },
    {
        category: '투자∙재테크 ',
        type: 3,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fvalue.svg?alt=media&token=a80e6c08-1471-40f1-9ff2-e5263bb1bf06',
    },
    {
        category: '푸드∙드링크',
        type: 4,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Ffood.svg?alt=media&token=60920bd9-b836-485d-9035-0422186d7dd1',
    },
    {
        category: '문화∙예술',
        type: 5,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fcurlture.svg?alt=media&token=225f0998-27f7-4835-b422-38f9bc667d8b',
    },
    {
        category: '음악∙댄스',
        type: 6,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fmusic.svg?alt=media&token=39846836-8e41-4a69-b756-f0118eca7272',
    },
    {
        category: '사진∙영상',
        type: 7,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fphoto.svg?alt=media&token=e818814c-1595-4cd4-af9b-1c6491a9b798',
    },
    {
        category: '패션∙뷰티',
        type: 8,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Ffashion.svg?alt=media&token=6d4d107b-678a-4770-9b94-66b622185d82',
    },
    {
        category: '창작∙만들기',
        type: 9,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fcreate.svg?alt=media&token=4b9b56d6-7f0b-4fcb-8f32-e65eaeb4d0f9',
    },
    {
        category: '여행',
        type: 10,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Ftravel.svg?alt=media&token=d1304b6d-8c3b-488a-8730-437f541b3c14',
    },
    {
        category: '독서∙글쓰기',
        type: 11,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fbook.svg?alt=media&token=76e2d35f-9fe5-4f0f-9d32-bf240ca1f89c',
    },
    {
        category: '취미',
        type: 12,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fhobby.svg?alt=media&token=29c1b9b5-416e-4490-95f8-5d35956b8b44',
    },
    {
        category: '반려동물',
        type: 13,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Fanimal.svg?alt=media&token=ff2bc0f7-420a-4677-a5e7-35b4a57c5297',
    },
    {
        category: '자유모임',
        type: 14,
        iconUrl: 'https://firebasestorage.googleapis.com/v0/b/onedaymate-b9037.appspot.com/o/category_icons%2Ffreemate.svg?alt=media&token=24c13b8d-659e-4cef-8e29-4cad1121c1ce',
    },
]

router.get("", (req, res) => {
    ModelCategory.find()
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});
router.get("/search/:category", (req, res) => {
    ModelCategory.find({category: req.params.category})
    .exec()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });
});

router.post("/dump/insert", auth.isAdmin, (req, res) => {
    // const model = new ModelCategory(req.body)
    // model.save()
    // .then((_) => res.json(response.success(_)))
    // .catch((_) => {
    //     var error = convertException(_)
    //     res.json(response.fail(error, error.errmsg, error.code))
    // });

    ModelCategory.insertMany(category)
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });

});

router.post("/", auth.isAdmin, (req, res) => {
    const model = new ModelCategory(req.body)
    model.save()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        var error = convertException(_)
        res.json(response.fail(error, error.errmsg, error.code))
    });

});

module.exports = router;
