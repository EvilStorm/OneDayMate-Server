var response = require('./response/response_util');

var {ResponseCode } = require('./response/response_code_store');
var {ExceptionType, createException, convertException} = require('./exception/exception_creator');
const { header } = require('express/lib/request');

auth = {}



auth.signCondition = function(req, res, next) {

  var token = req.headers['identifyid'];
  var userId = req.headers['userid'];
  req.decoded = {
    token: token,
    id: userId,
  };
  
  next();
}

auth.isSignIn = function(req, res, next) {

  var token = req.headers['identifyid'];
  var userId = req.headers['userid'];
  
  if (!token || !userId) {
    var error = createException(ExceptionType.REQUIRED_JWT_TOKEN);
    res.json(response.fail(error, error.errmsg, error.code));
  } else {
    req.decoded = {
      token: token,
      id: userId,
    };
    
    next();
  }
}

auth.isAdmin = function(req, res, next) {

  var token = req.headers['identifyid'];
  if(token != null && token == 'admin') {
    req.decoded = {
      token: req.headers['identifyid'],
      id: req.headers['userid'],
    };
    next();
  } else {
    var error = createException(ExceptionType.REQUIRED_JWT_TOKEN);
    res.json(response.fail(error, error.errmsg, error.code));
  }
}

module.exports = auth;
