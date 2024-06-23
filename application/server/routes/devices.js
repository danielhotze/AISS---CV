// routes/devices.js
const express = require('express');
const router = express.Router();
const Device = require('../data/device');

// POST /devices - Neues Device hinzufügen
router.post('/devices', async (req, res) => {
  try {
    const { id, name, ip, location, status } = req.body;
    const newDevice = new Device({ id, name, ip, location, status });
    const savedDevice = await newDevice.save();
    console.log('Successfully created new device')
    res.status(201).json(savedDevice);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /devices - Alle Devices abrufen
router.get('/devices', async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (error) {
    console.error('Error retrieving devices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /devices/:id - Ein spezifisches Device abrufen
router.get('/devices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const device = await Device.findOne({'id': id});
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    console.error('Error retrieving device by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /devices/:id - Device löschen
router.delete('/devices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDevice = await Device.findByIdAndDelete(id);
    if (!deletedDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
