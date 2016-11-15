const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: 'Session' },
  question: { type: Schema.Types.ObjectId, ref: 'Message' },
  create_date: Date,
  public: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }
});

ThreadSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

ThreadSchema
.pre('save', function (next) {
  if (!this.isNew) {
    return next();
  }
  
  this.create_date = new Date();

  next();
});

ThreadSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'create_date question session';
    
    return this.findOne(options.criteria)
      .select(options.select)
      .populate({
        path: 'question',
        model: 'Message',
        select: 'text user',
        populate: {
          path: 'user',
          model: 'User',
          select: 'name'
        }
      })
      .exec(cb);
  }
};

mongoose.model('Thread', ThreadSchema);
