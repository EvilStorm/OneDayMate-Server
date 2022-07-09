var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    category: {type: String,index: true,},
    tag: {type: String, index: true, unique: true,},
    count: {type: Number, default: 0,},
    createdAt: {type: Date, default: Date.now, select: false,},
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('Tag', schema);
