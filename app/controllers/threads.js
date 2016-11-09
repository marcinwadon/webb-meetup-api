const mongoose = require('mongoose');
const { wrap: async } = require('co');

const Thread = mongoose.model('Thread');
const Message = mongoose.model('Message');

exports.load = async(function* (req, res, next, _id) {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ error: 'Thread not found.' });
  }

  const criteria = { _id };

  try {
    req.thread = yield Thread.load({ criteria });

    if (!req.thread) {
      return res.status(404).json({ error: 'Thread not found.' });
    }
  } catch (err) {
    return next(err);
  }

  next();
});

exports.list = async(function* (req, res) {
  if (req.thread) {
    return res.json({ thread: req.thread });
  }

  const threads = yield Thread
    .find()
    .select()
    .populate('question', 'text user')
    .exec();

  res.json({ threads });
});
