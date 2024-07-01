const express = require('express');
const router = express.Router();
const Incident = require('../data/incident');

// POST /incidents - Create new incident
// http://<server_ip>:3000/api/incidents
router.post('/incidents', async (req, res) => {
  try {
    const { id, timestamp, deviceID, incidentType } = req.body;

    const incident = new Incident({
      id: id,
      timestamp_start: new Date(timestamp),
      timestamp_end: new Date(timestamp),
      deviceID: deviceID,
      incidentType: incidentType,
    });

    const savedIncident = await incident.save();
    res.status(201).json(savedIncident);
  } catch (error) {
    console.error('Error creating/updating incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /incidents - Update existing incident
// http://<server_ip>:3000/api/incidents/:id
router.put('/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp } = req.body;

    const incident = await Incident.findOneAndUpdate(
      { id },
      {
        $max: { timestamp_end: new Date(timestamp) }, // Set timestamp_end to the new value
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
// http://<server_ip>:3000/api/incidents/
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
// http://<server_ip>:3000/api/incidents/:deviceID
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
