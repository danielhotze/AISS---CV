const express = require('express');
const router = express.Router();
const IncidentImage = require('../data/incidentImage');
const path = require('path');

// _ _ _ _ _ _ _ _ _ _ x!(post incidents) (post upload) _ x (put incidents) _ _ _ x _ _

module.exports = (upload) => {
  // POST /upload - Upload incident image
  // http://server_ip:3000/api/upload
  router.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const { name, timestamp, incidentID  } = req.body;
      // const imageName = req.file.filename;

      const incidentImage = new IncidentImage({
        name: name,
        timestamp: timestamp,
        incidentID: incidentID,
      });

      const savedIncidentImage = await incidentImage.save();
      res.status(201).json(savedIncidentImage);
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // GET /incidentImages - Request all incident images
  // http://server_ip:3000/api/incidentImages
  router.get('/incidentImages', async (req, res) => {
    try {
      const incidentImages = await IncidentImage.find();
      const imagesWithUrl = incidentImages.map((img) => {
        // const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${img.name}`;
        const imageUrl = path.join(__dirname, '..', '..', 'uploads', img.name);
        return {
          ...img.toObject(),
          imageUrl
        };
      })
      res.json(imagesWithUrl);
    } catch (error) {
      console.error('Error retrieving incident images:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // GET /incidentImages/:incidentID - Request all incident images of a specific incident
  // http://server_ip:3000/api/incidentImages/:incidentID
  router.get('/incidentImages/:incidentID', async (req, res) => {
    const { incidentID } = req.params;
    try {
      const incidentImages = await IncidentImage.find({'incidentID': incidentID});
      const imagesWithUrl = incidentImages.map((img) => {
        // const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${img.imageName}`;
        const imageUrl = path.join(__dirname, '..', '..', 'uploads', img.name);
        return {
          ...img.toObject(),
          imageUrl
        };
      })
      res.json(imagesWithUrl);
    } catch (error) {
      console.error('Error retrieving incident images:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
