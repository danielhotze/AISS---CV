const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ip: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], required: true }
});

module.exports = mongoose.model('Device', deviceSchema);
