var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    mate: { type: Schema.Types.ObjectId, ref: 'Mate', index: true },
    //지원자
    appliedMember: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    //참여 승인된 맴버
    acceptedMember: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    //참여 거부 된 맴버
    deniedMember: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isShow: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false, // You should be aware of the outcome after set to false
  }
);

module.exports = mongoose.model('MateMember', schema);
