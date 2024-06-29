const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const deviceRoutes = require('./routes/devices');
const incidentRoutes = require('./routes/incidents');
const incidentImageRoutes = require('./routes/incidentImages');

const app = express();
const port = 3000;

/******************************* Database Setup *******************************/
mongoose.connect('mongodb://localhost:27017/detectiondb', {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('[Server: Connected to MongoDB database.]');
});

/******************************* Multer Setup *******************************/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/PPE-Detection_uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })

/******************************* Middleware *******************************/
app.use(express.json());
app.use('/PPE-Detection_uploads', express.static('uploads'));
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
// TODO


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
