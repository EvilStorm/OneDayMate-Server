const express = require('express');
const router = express.Router();
const response = require('../components/response/response_util');

const kakao_auth = require('./kakao_auth.js');

var admin = require("firebase-admin");

// var serviceAccount = require("../onedaymate-b9037-firebase-adminsdk-4o2eq-6b8a8e1690.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

router.get('/callbacks/kakao/signIn', async function (req, res) {
    const redirect = `webauthcallback://success?${new URLSearchParams(req.query).toString()}`;
    console.log(`Redirecting to ${redirect}`);
    response.redirect(307, redirect);
});

router.post('/callbacks/kakao/token', async function (req, res) {

    console.log(req.body)
    kakao_auth.createFirebaseToken(req.body["accessToken"],(result)=>{
      res.send(result);
    });
});

module.exports = router;