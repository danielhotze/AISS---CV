const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

const deviceRoutes = require('./routes/devices');
const incidentRoutes = require('./routes/incidents');
const incidentImageRoutes = require('./routes/incidentImages');
const Device = require('./data/device');

const app = express();
const port = 3000;
const CHECK_DEVICE_PERIOD = 60000;

const UPLOAD_DIR = '/PPE-Detection_uploads';

/******************************* Database Setup *******************************/
mongoose.connect('mongodb://localhost:27017/detectiondb', {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('[Server: Connected to MongoDB database.]');
});

/******************************* File-System Setup *******************************/
// const uploadDir = path.join(__dirname, 'PPE-Detection_uploads');
// let's just dump images into C:/PPE-Detection_uploads for now - not pretty but works fine
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

/******************************* Multer Setup *******************************/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })

/******************************* Middleware *******************************/
app.use(express.json());
// app.use('/images', express.static('/PPE-Detection_uploads'));
app.use(express.urlencoded({ extended: true }));

/******************************* Routes *******************************/
app.use('/api', deviceRoutes);
app.use('/api', incidentRoutes);
app.use('/api', incidentImageRoutes(upload));

app.get('/', function (req, res) {
  res.send('The server is running!');
});

/******************************* Start Server *******************************/
const serverInstance = app.listen(port, () => {
  console.log(`[Server: Server is running on http://localhost:${port}]`);
});

/******************************* Periodic Device Status Checks *******************************/
const checkDeviceStatus = async () => {
  try {
    const devices = await Device.find({ status: 'Active' });
    for(const device of devices) {
      try {
        const response = await axios.get(`http://${device.ip}:5000/ping?deviceId=${device.id}`, { timeout: 5000 });
        if (response.status === 200) {
          console.log(`Device ${device.ip} (${device.name}) is active.`);
          res.json({ message: `Device ${device.ip} (${device.name}) is now active.`})
        }
      } catch (error) {
        console.error(`Device ${device.name} is inactive. Error: ${error.message}`);
        await Device.findOneAndUpdate({ id: device.id }, { status: 'Inactive' });
      }
    }
  } catch (error) {
    console.error('Error checking device statuses:', error);
  }
}

// Every minute - check the status of all previously active devices.
setInterval(checkDeviceStatus, CHECK_DEVICE_PERIOD);

/******************************* Graceful shutdown function *******************************/
async function gracefulShutdown() {
  console.log('[Server: Shutting down gracefully...]');
  try {
    await serverInstance.close();
    await mongoose.disconnect();
    console.log('[Server: HTTP server and MongoDB connection closed.]');
    process.exit(0);
  } catch (error) {
    console.error(`[Server: Error during graceful shutdown: ${error}]`);
    process.exit(1);
  }
}

process.parentPort.once('message', (e) => {
  const msg = e.data.message;
  if (msg === 'shutdown') {
    console.log('[Server: Shutdown message received.]');
    gracefulShutdown();
  }
})

// handle "kill" (signal terminate) being received -> perform shutdown
process.on('SIGTERM', () => {
  console.log('[Server: SIGTERM signal received: closing HTTP server.]');
  gracefulShutdown();
});
