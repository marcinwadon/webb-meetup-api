const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  name: String,
  description: { type: String, default: '' },
  location: String,
  timeStart: String,
  timeEnd: String,
  speakers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

SessionSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

SessionSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'name description location timeStart timeEnd speakers';
    
    return this.findOne(options.criteria)
      .select(options.select)
      .populate('speakers', 'id email name')
      .exec(cb);
  }
};

mongoose.model('Session', SessionSchema);
