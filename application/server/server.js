const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// Database Setup:
mongoose.connect('mongodb://localhost:27017/detectiondb', {
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  process.stdout.write('Connected to MongoDB database\n');
});

//Middleware and Routes:
app.get('/', function (req, res) {
  res.send('The server is running!');
});

const server = app.listen(port, () => {
  process.stdout.write(`Server is running on http://localhost:${port}\n`);
});

// Gracefully shut down the server
process.on('SIGTERM', () => {
  process.stdout.write('SIGTERM signal received: closing HTTP server\n');
  server.close(() => {
    process.stdout.write('Server closed successfully\n');
    process.exit(0); // Exit process when the server is closed
  });
});
