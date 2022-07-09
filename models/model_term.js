var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    seq : {type:Number, index:true, unique: true},
    term: {type:String},
    userTerm: {type:String},
    release : {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now}    
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('Term', schema);
