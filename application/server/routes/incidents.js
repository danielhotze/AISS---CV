const express = require('express');
const router = express.Router();
const Incident = require('../data/incident');

// POST /incidents - Neuen Incident hinzufügen oder vorhandenen aktualisieren
router.post('/incidents', async (req, res) => {
  try {
    const { incidentID, timestamp, deviceID, imageUrl } = req.body;
    let incident = await Incident.findOne({ incidentID });

    if (!incident) {
      // Neuen Incident anlegen
      incident = new Incident({ id: incidentID, timestamp_start: timestamp, timestamp_end: timestamp, deviceID: deviceID, images: [{timestamp, imageUrl}] });
    } else {
      // Incident aktualisieren
      incident.timestamp_end = timestamp;
      incident.images.push({timestamp, imageUrl});
    }

    const savedIncident = await incident.save();
    res.status(201).json(savedIncident);
  } catch (error) {
    console.error('Error creating/updating incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /incidents - Alle Incidents abrufen
router.get('/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (error) {
    console.error('Error retrieving incidents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /incidents/:deviceID - Alle Incidents eines Devices abrufen
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
