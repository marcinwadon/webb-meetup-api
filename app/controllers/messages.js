const mongoose = require('mongoose');
const { wrap: async } = require('co');

const Thread = mongoose.model('Thread');
const Message = mongoose.model('Message');
const Session = mongoose.model('Session');

exports.load = async(function* (req, res, next, _id) {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  const criteria = { _id };

  try {
    req.message = yield Message.load({ criteria });

    if (!req.message) {
      return res.status(404).json({ error: 'Message not found.' });
    }
  } catch (err) {
    return next(err);
  }

  next();
});

exports.list = async(function* (req, res) {
  if (req.message) {
    return res.json({ message: req.message });
  }

  const messages = yield Message
    .find({ thread: req.thread })
    .select()
    .populate('user', 'name')
    .exec();

    res.json({ messages });
});

exports.create = async(function* (req, res) {
  const thread = new Thread();
  thread.session = req.session;

  try {
    yield thread.save();
  } catch (err) {
    res.status(500).json({});
  }

  const message = new Message();
  message.user = req.user;
  message.thread = thread;
  message.text = req.body.text;

  try {
    yield message.save();
  } catch (err) {
    res.status(500).json({});
  }

  thread.question = message;

  try {
    yield thread.save();
  } catch (err) {
    res.status(500).json({});
  }
  
  res.status(201).json();
});

exports.add = async(function* (req, res) {
  if (!userIsOwner(req.user, req.thread) 
    && !(yield userIsSpeaker(req.user, req.thread.session))
  ) {
    return res.status(403).json();
  }

  const message = new Message();
  message.user = req.user;
  message.thread = req.thread;
  message.text = req.body.text;

  if (yield userIsSpeaker(req.user, req.thread)) {
    req.thread.public = true;

    try {
      yield req.thread.save();
    } catch (err) {
      res.status(500).json({});
    }
  }

  try {
    yield message.save();
  } catch (err) {
    res.status(500).json({});
  }

  res.status(201).json();
});

function userIsOwner(user, thread) {
  return user._id.toString() === thread.question.user._id.toString();
}

const userIsSpeaker = async(function* (user, sessionId) {
  const session = yield Session
    .findOne({ _id: sessionId })
    .select('speakers')
    .populate('speakers', 'user')
    .exec();

  if (!session) {
    return false;
  }

  for (let speaker of session.speakers) {
    if (user._id.toString() === speaker.user._id.toString()) {
      return true;
    }
  }

  return false;
})
