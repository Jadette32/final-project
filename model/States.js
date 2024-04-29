const mongoose = require('mongoose');

// Define the schema for state data
const stateSchema = new mongoose.Schema({
    stateCode: {
        type: String,
        required: true,  // State code is required
        unique: true     // State code must be unique
    },
    funfacts: [String]  // Array of strings for fun facts
});

// Create a Mongoose model based on the schema
const State = mongoose.model('State', stateSchema);

module.exports = State;
