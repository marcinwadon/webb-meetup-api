const mongoose = require('mongoose');
const { wrap: async } = require('co');

const SpeakerDetail = mongoose.model('SpeakerDetail');

exports.load = async(function* (req, res, next, _id) {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ error: 'Speaker not found.' });
  }

  const criteria = { _id };

  try {
    req.speaker = yield SpeakerDetail.load({ criteria });

    if (!req.speaker) {
      return res.status(404).json({ error: 'Speaker not found.' });
    }
  } catch (err) {
    return next(err);
  }

  next();
});

exports.list = async(function* (req, res) {
  if (req.speaker) {
    return res.json({ speaker: req.speaker });
  }

  const speakers = yield SpeakerDetail
    .find()
    .select('user bio www picture social_media')
    .populate('user', 'id name email')
    .exec();

    res.json({ speakers });
});
