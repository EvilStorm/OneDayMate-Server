var express = require('express');
var router = express.Router();
var response = require('../components/response/response_util');
var {ResponseCode } = require('../components/response/response_code_store');
var {ExceptionType, createException, convertException} = require('../components/exception/exception_creator');

var auth = require('../components/auth');
var DBConst = require('../db/constant');
var ModelBriefAddress = require('../models/model_brief_address');

const axios = require("axios");
const cheerio = require("cheerio");
const convert = require('xml-js');


const cityList = [
    {value: 11, title:'서울'},
    {value: 26, title:'부산'},
    {value: 27, title:'대구'},
    {value: 28, title:'인천'},
    {value: 29, title:'광주'},
    {value: 30, title:'대전'},
    {value: 31, title:'울산'},
    {value: 36, title:'세종'},
    {value: 41, title:'경기도'},
    {value: 42, title:'강원도'},
    {value: 43, title:'충청북도'},
    {value: 44, title:'충청남도'},
    {value: 45, title:'전라북도'},
    {value: 46, title:'전라남도'},
    {value: 47, title:'경상북도'},
    {value: 48, title:'경상남도'},
    {value: 50, title:'제주'},
];


router.get('/city', (req, res) => {
    var values = cityList.map((item) => item.title);
    res.json(response.success(values))
});

router.get('/gu/:city', (req, res) => {
    ModelBriefAddress.find({
        city: req.params.city,
    })
    .distinct('gu')
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        console.log(_);
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    });

});

router.get('/dong/:city/:gu', (req, res) => {
    ModelBriefAddress.find({
        city: req.params.city,
        gu: req.params.gu
    })
    .distinct('dong')
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        console.log(_);
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    });

});

router.get('/search/:word', (req, res) => {
    // ModelBriefAddress.find({
    //     fullAddress: /req.params.word/
    // })
    ModelBriefAddress.find({
        fullAddress: {$regex: req.params.word, $options: 'i'}
    })
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        console.log(_);
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    });

});


router.get('/clear', (req, res) => {
    ModelBriefAddress.deleteMany()
    .then((_) => res.json(response.success(_)))
    .catch((_) => {
        console.log(_);
        var error = convertException(_);
        res.json(response.fail(error, error.errmsg, error.code));
    });

});

router.get('/dumpInert', async (req, res) => {
    await crawling()

    res.json(response.success({result: 1}));
});

async function crawling() {

    var result = [];


    for (var i=0; i<cityList.length; i++) {
        const city = cityList[i];
        const resGuList = await axios.get(`https://www.juso.go.kr/getAreaCode.do?from=city&to=county&valFrom=${city.value}&valTo=&rdIndex=undefined`);
        var xmlToJson = convert.xml2json(resGuList.data, {compact: true, spaces: 3});
        const makeJson = JSON.parse(xmlToJson);
        const guList = makeJson.counties;
        for(var j=0; j<guList.name.length; j++) {
            const guName = guList.name[j]._text;
            const guValue = city.value + guList.value[j]._text;
    console.log(`URL: https://www.juso.go.kr/getAreaCode.do?from=county&to=town&valFrom=${guValue}&valTo=&rdIndex=undefined`);
            const resDongList = await axios.get(`https://www.juso.go.kr/getAreaCode.do?from=county&to=town&valFrom=${guValue}&valTo=&rdIndex=undefined`);
            // https://www.juso.go.kr/getAreaCode.do?from=county&to=town&valFrom=28200&valTo=&rdIndex=undefined

            var xmlToJson2 = convert.xml2json(resDongList.data, {compact: true, spaces: 3});

            const dongMakeJson = JSON.parse(xmlToJson2);
            const dongList = dongMakeJson.towns;

            if(dongList.name === undefined) {
                var data = {
                    city: city.title,
                    gu: guName,
                    dong: "",
                    fullAddress: `${city.title} ${guName}`
                }
                result.push(data);
                continue;
            }
            for(var k=0; k<dongList.name.length; k++) {
                const dongName = dongList.name[k]._text;
                var data = {
                    city: city.title,
                    gu: guName,
                    dong: dongName,
                    fullAddress: `${city.title} ${guName} ${dongName}`
                }

                console.log(data);

                result.push(data);
            }
        }
    }

    const insertResult = await ModelBriefAddress.insertMany(result);
    console.log(insertResult);
}


module.exports = router;
