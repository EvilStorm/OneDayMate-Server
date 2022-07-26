var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User', index: true,},
    images: [{type: String}],
    title: {type: String},
    message: {type: String},
    minAge: {type: Number, default: 0},
    maxAge: {type: Number, default: 0},
    loc: { type: {type:String}, coordinates: [Number]},
    locationStr: {type: String},
    memberLimit: {type: Number, default: 4},
    member: {type: Schema.Types.ObjectId, ref: 'MateMember'},
    mateDate: {type: Date, default: Date.now},
    category: [{type: Schema.Types.ObjectId, ref: 'Category', index: true}],
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag', index: true}],
    reply: [{type: Schema.Types.ObjectId, ref: 'Reply'}],
    isShow: {type:Boolean, default:true},
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('Mate', schema);
