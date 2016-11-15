const mongoose = require('mongoose');
const { wrap: async } = require('co');

const Thread = mongoose.model('Thread');
const Message = mongoose.model('Message');

exports.load = async(function* (req, res, next, _id) {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ error: 'Thread not found.' });
  }

  const criteria = { _id, deleted: false };

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
    .find({ session: req.session, deleted: false})
    .select('create_date session question public')
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
    .exec();

  res.json({ threads });
});

exports.delete = async(function * (req, res) {
  if (!req.thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  req.thread.deleted = true;

  try {
    yield req.thread.save();

    return res.sendStatus(204); 
  } catch (err) {
    res.sendStatus(500);
  }
});
