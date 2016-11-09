const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SpeakerDetailSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  bio: { type: String, default: '' },
  www: { type: String, default: '' },
  picture: { type: String, default: '' },
  social_media: [{ key: String, url: String }]
});

SpeakerDetailSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

SpeakerDetailSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'user bio www picture social_media';
    return this.findOne(options.criteria)
      .select(options.select)
      .populate('user', 'id name email')
      .exec(cb);
  }
};

mongoose.model('SpeakerDetail', SpeakerDetailSchema);
