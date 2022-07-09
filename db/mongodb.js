const mongoose = require('mongoose');
var connect = function(){
  //test
  url = 'mongodb+srv://evilstorm:wkfgo1!@onedaymate.psk7fhb.mongodb.net/test?retryWrites=true&w=majority';

  //live
  // url = 'mongodb+srv://evilstorm:shoppingmate@cluster0.snycc.mongodb.net/test?retryWrites=true&w=majority'


/**
 * [poolSize,ssl,sslValidate,sslCA,sslCert,sslKey,sslPass,sslCRL,
 * autoReconnect,noDelay,keepAlive,keepAliveInitialDelay,connectTimeoutMS,family,
 * socketTimeoutMS,reconnectTries,reconnectInterval,ha,haInterval,replicaSet,secondaryAcceptableLatencyMS,
 * acceptableLatencyMS,connectWithNoPrimary,authSource,w,wtimeout,j,
 * forceServerObjectId,serializeFunctions,ignoreUndefined,raw,bufferMaxEntries,
 * readPreference,pkFactory,promiseLibrary,readConcern,maxStalenessSeconds,loggerLevel,logger,
 * promoteValues,promoteBuffers,promoteLongs,domainsEnabled,checkServerIdentity,validateOptions,
 * appname,auth,user,password,authMechanism,compression,fsync,readPreferenceTags,numberOfRetries,
 * auto_reconnect,minSize,monitorCommands,retryWrites,retryReads,useNewUrlParser,
 * useUnifiedTopology,serverSelectionTimeoutMS,useRecoveryToken,autoEncryption,driverInfo]
 */
  const serverOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    promiseLibrary: global.Promise
  };
  
  mongoose.connect(url, serverOptions)
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));

};

module.exports = {
    connect: connect
};
