var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    email: {type: String, require: true, index: true},
    identifyId: {type: String, unique: true, require: true},
    nickName: {type: String, default: null},
    gender: {type: Boolean, default: null },
    age: {type: Number, default: null },
    secureLevel: {type: Number, default: 0}, // 0: 일반유저, 10: Admin
    pictureMe: {type: String, default: null },
    aboutMe: {type: String, default: "." },
    pushToken: {type: String, default: null},
    setting: {type: Schema.Types.ObjectId, ref: 'Setting', default:null},
    createdAt: {type: Date, default: Date.now}
}, {
    versionKey: false 
});


module.exports = mongoose.model('User', schema);
