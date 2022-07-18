var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    city: {type:String},
    gu: {type:String},
    dong: {type:String},
    fullAddress: {type:String},
    createdAt: {type: Date, default: Date.now}    
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('BriefAddress', schema);