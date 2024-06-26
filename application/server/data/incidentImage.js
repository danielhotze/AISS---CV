const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  name: { type: String, required: true, unique: true }, // Name of the image: '<incidentID>_<timestamp>.png', '<incidentID>_<timestamp>.jpg', ...
  timestamp: { type: Date, required: true },
  incidentID: { type: String, required: true }
});

module.exports = mongoose.model('IncidentImage', imageSchema);
