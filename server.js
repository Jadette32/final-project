// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { logger } = require('./middleware/logEvents');
const { errorHandler } = require('./middleware/errorHandler');


// Create Express app
const app = express();

// Define the desired port
const PORT = process.env.PORT || 3500; // Use the port from environment variable or default to 3500

// Middleware
app.use(logger); // Request logging middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '/public')));

// Routes
const statesRouter = require('./routes/api/states');
app.use('/states', statesRouter);


// MongoDB connection
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING;
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // Start the server once connected to MongoDB
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// 404 Not Found handler
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('text').send('404 Not Found');
  }
});

// Error handling middleware
app.use(errorHandler);
