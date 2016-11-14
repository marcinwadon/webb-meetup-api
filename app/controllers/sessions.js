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
    .select()
    .populate('speakers', 'name')
    .exec();

    res.json({ sessions });
});
