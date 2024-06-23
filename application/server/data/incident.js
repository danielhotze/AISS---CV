const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  timestamp: { type: Date, required: true },
  imageUrl: { type: String, required: true } // Speicherort des Bildes
});

const incidentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  timestamp_start: { type: Date, required: true },
  timestamp_end: { type: Date },
  deviceID: { type: String, required: true },
  images: [imageSchema]
});

module.exports = mongoose.model('Incident', incidentSchema);
