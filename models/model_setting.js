var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    likeAlarm: {type: Boolean, default: true},
    replyAlarm:  {type: Boolean, default: true},
    systemAlarm: {type: Boolean, default: true},
    emailSend: {type: Boolean, default: true},
    mateJoinAlarm: {type: Boolean, default: true},
    mateAcceptAlarm: {type: Boolean, default: true},
    messageAlarm: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now, select: false},
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('Setting', schema);
