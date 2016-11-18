const mongoose = require('mongoose');
const { wrap: async } = require('co');

const Thread = mongoose.model('Thread');
const Message = mongoose.model('Message');

exports.load = async(function* (req, res, next) {
  const _id = req.params.threadId;

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

  let userIsSpeaker = false;
  for (let speaker of req.session.speakers) {
    if (speaker.user._id.toString() === req.user._id.toString()) {
      userIsSpeaker = true;
    }
  }


  const publicThreads = yield Thread
    .find({
      session: req.session,
      deleted: false,
      public: true
    })
    .select('create_date session question public')
    .populate({
      path: 'question',
      model: 'Message',
      select: 'text user create_date',
      populate: {
        path: 'user',
        model: 'User',
        select: 'name'
      }
    })
    .exec();

  const unpublicThreads = yield Thread
    .find({
      session: req.session,
      deleted: false,
      public: false
    })
    .select('create_date session question public')
    .populate({
      path: 'question',
      model: 'Message',
      select: 'text user create_date',
      populate: {
        path: 'user',
        model: 'User',
        select: 'name'
      }
    })
    .exec();

    let myThreads = [];

    for (let thread of unpublicThreads) {
      if (
        !userIsSpeaker &&
        req.user.role !== 'ROLE_ADMIN' &&
        thread.question.user._id.toString() === req.user._id.toString()
      ) {
        myThreads.push(thread);
      }

      if (userIsSpeaker || req.user.role === 'ROLE_ADMIN') {
        myThreads.push(thread);
      }
    }

  res.json({ threads: [...publicThreads, ...myThreads] });
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
