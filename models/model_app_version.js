var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const AppVersionSchema = new Schema({
    appVer : {type: Number, index : true, unique: true},
    say: {type: String},
    isMustUpdate : {type:Boolean, default: false},
    isShow: {type:Boolean, default:true},
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('AppVersion', AppVersionSchema);
