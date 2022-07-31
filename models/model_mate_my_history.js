var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    created: [{ type: Schema.Types.ObjectId, ref: 'Mate', index: true }],
    liked: [{ type: Schema.Types.ObjectId, ref: 'Mate' }],
    police: [{ type: Schema.Types.ObjectId, ref: 'Mate' }],
    applied: [{ type: Schema.Types.ObjectId, ref: 'Mate' }],
    accepted: [{ type: Schema.Types.ObjectId, ref: 'Mate' }],
    denied: [{ type: Schema.Types.ObjectId, ref: 'Mate' }],
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false, // You should be aware of the outcome after set to false
  }
);

module.exports = mongoose.model('MateMyHistory', schema);
