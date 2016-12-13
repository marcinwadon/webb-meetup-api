const mongoose = require('mongoose');
const { wrap: async } = require('co');

const MapPoint = mongoose.model('MapPoint');

exports.list = async(function* (req, res) {
  const mapPoints = yield MapPoint.find();
  res.json({ mapPoints });
});

exports.create = async(function* (req, res) {
  const mapPoint = new MapPoint();

  mapPoint.name = req.body.name;
  mapPoint.lat = req.body.lat;
  mapPoint.lng = req.body.lng;
  mapPoint.center = req.body.center;

  try {
    yield mapPoint.save();

    res.json({
      type: 'success',
      id: mapPoint._id
    });
  } catch (err) {
    res.json({
      type: 'error',
      mapPoint
    }, 400);
  }
});
