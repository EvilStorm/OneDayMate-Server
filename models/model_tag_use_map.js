var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema({
    mate: {type: Schema.Types.ObjectId, ref: 'Mate'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    tag: {type: Schema.Types.ObjectId, ref: 'Tag'},
    createdAt: {type: Date, default: Date.now, select: false},
}, {
    versionKey: false 
});


module.exports = mongoose.model('TagUseMap', schema);
