const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  thread: { type: Schema.Types.ObjectId, ref: 'Thread' },
  text: String,
  create_date: Date
});

MessageSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

MessageSchema
.pre('save', function (next) {
  if (!this.isNew) {
    return next();
  }
  
  this.create_date = new Date();

  next();
});

MessageSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'create_date';
    
    return this.findOne(options.criteria)
      .select(options.select)
      .populate('user', 'name')
      .exec(cb);
  }
};

mongoose.model('Message', MessageSchema);
