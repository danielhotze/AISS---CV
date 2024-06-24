const express = require('express');
const router = express.Router();
const Incident = require('../data/incident');

// POST /incidents - Create new incident
router.post('/incidents', async (req, res) => {
  try {
    const { id, timestamp, deviceID, incidentType, imageUrl } = req.body;

    const incident = new Incident({
      id,
      timestamp_start: timestamp,
      timestamp_end: timestamp,
      deviceID,
      incidentType,
      images: [{ timestamp, imageUrl }]
    });

    const savedIncident = await incident.save();
    res.status(201).json(savedIncident);
  } catch (error) {
    console.error('Error creating/updating incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /incidents - Update existing incident
router.put('/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp, imageUrl } = req.body;

    const incident = await Incident.findOneAndUpdate(
      { id },
      {
        $max: { timestamp_end: timestamp }, // Set timestamp_end to the new value
        $push: { images: { timestamp, imageUrl } }
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.status(200).json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// GET /incidents - Request all Incidents
router.get('/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (error) {
    console.error('Error retrieving incidents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /incidents/:deviceID - Request all Incidents from a specific device
router.get('/incidents/:deviceID', async (req, res) => {
  const { deviceID } = req.params;
  try {
    const incidents = await Incident.find({'deviceID': deviceID});
    res.json(incidents);
  } catch (error) {
    console.error('Error retrieving incidents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
