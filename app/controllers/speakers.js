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

exports.change = async(function* (req,res) {
  if (req.body.bio) {
    req.speaker.bio = req.body.bio;
  }

  if (req.body.www) {
    req.speaker.www = req.body.www;
  }

  if (req.body.picture) {
    req.speaker.picture = req.body.picture;
  }

  if (req.body.social_media) {
    req.speaker.social_media = req.body.social_media;
  }

  try {
    yield req.speaker.save();
  } catch (err) {
    return res.status(500).json({ error: err });
  }

  return res.status(200).json({});
});
