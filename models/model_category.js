var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    category: {type: String,index: true,},
    type: {type: Number,index: true},
    iconUrl: {type: String,},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag', default:null}],
    createdAt: {type: Date, default: Date.now, select: false,},
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('Category', schema);
