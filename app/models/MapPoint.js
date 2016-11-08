const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MapPointSchema = new Schema({
  name: { type: String, default: '', trim: true },
  lat: Number,
  lng: Number,
  center: Boolean
});

MapPointSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

mongoose.model('MapPoint', MapPointSchema);
