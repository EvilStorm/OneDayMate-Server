var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const schema = new Schema(
  {
    mate: { type: Schema.Types.ObjectId, ref: 'Mate', index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    reason: { type: Number, default: 0 },
    feedback: { type: String, default: null },
    feedbackDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false, // You should be aware of the outcome after set to false
  }
);

module.exports = mongoose.model('police', schema);
