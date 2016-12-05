const mongoose = require('mongoose');
const { wrap: async } = require('co');

const Session = mongoose.model('Session');

exports.load = async(function* (req, res, next, _id) {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  const criteria = { _id };

  try {
    req.session = yield Session.load({ criteria });

    if (!req.session) {
      return res.status(404).json({ error: 'Session not found.' });
    }
  } catch (err) {
    return next(err);
  }

  next();
});

exports.list = async(function* (req, res) {
  if (req.session) {
    return res.json({ session: req.session });
  }

  const sessions = yield Session
    .find()
    .select('name description location timeStart timeEnd speakers')
    .populate({
        path: 'speakers',
        model: 'SpeakerDetail',
        select: 'user bio www picture social_media',
        populate: {
          path: 'user',
          model: 'User',
          select: 'name email bio'
        }
      })
    .exec();

    res.json({ sessions });
});

exports.change = async(function* (req, res) {
  if (req.body.name) {
    req.session.name = req.body.name;
  }

  if (req.body.description) {
    req.session.description = req.body.description;
  }

  if (req.body.timeStart) {
    req.session.timeStart = req.body.timeStart;
  }

  if (req.body.timeEnd) {
    req.session.timeEnd = req.body.timeEnd;
  }

  if (req.body.location) {
    req.session.location = req.body.location;
  }

  try {
    yield req.session.save();
  } catch (err) {
    return res.status(500).json({ error: err });
  }

  return res.status(200).json({});
});
