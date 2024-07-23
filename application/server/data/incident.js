const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incidentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  timestamp_start: { type: Date, required: true },
  timestamp_end: { type: Date },
  deviceID: { type: String, required: true },
  incidentType: { type: [String], required: true },
});

module.exports = mongoose.model('Incident', incidentSchema);
