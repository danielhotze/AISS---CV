// routes/devices.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Device = require('../data/device');

// POST /devices - Insert a new Device
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

// GET /devices - Request all Devices
router.get('/devices', async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (error) {
    console.error('Error retrieving devices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /devices/:deviceId - Request a specific Device
router.get('/devices/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  try {
    const device = await Device.findOne({'id': deviceId});
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    console.error('Error retrieving device by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /devices/:deviceId - Delete a specific Device
router.delete('/devices/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  try {
    const deletedDevice = await Device.findOneAndDelete({'id': deviceId});
    if (!deletedDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /devices/connect/:deviceId - Try to send the Server-IP to the specified Device to establish a connection
router.get('/devices/connect/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  try {
    const device = await Device.find({id: deviceId});
    if (!device) {
      return res.status(404).json({ error: 'Cannot ping Device - Device not found' });
    }
    const response = await axios.get(`http://${device.ip}:5000/ping`, { timeout: 5000 });
    if (response.status === 200) {
      console.log(`Device ${device.ip} (${device.name}) is active.`);
      res.json({ message: `Device ${device.ip} (${device.name}) is now active.`})
    }
  } catch (error) {
    console.error('Error trying to ping the device:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})

module.exports = router;
