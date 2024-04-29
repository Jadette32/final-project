const State = require('../model/States');

// Loads stateData for a given state into req.stateData
const stateData = async (req, res, next) => {
    try {
        if (!req.params.state) {
            return res.status(400).json({ message: 'State abbreviation parameter is required' });
        }

        const stateCode = req.params.state.toUpperCase();

        // Read state data from states.json
        const statesData = require('../model/statesData.json');
        const staticState = statesData.states.find(state => state.code === stateCode);

        // Read state data from MongoDB
        const state = await State.findOne({ stateCode }).lean();

        // If both sources of data return nothing, then the code must be invalid.
        if (!staticState && !state) {
            return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
        }

        // Object spread syntax merges the two state objects.
        // If either state object does not exist, spread syntax ignores the undefined value.
        const mergedState = {
            ...staticState,
            ...state
        };

        // Since the state code is expected to be returned as 'code', which comes from the static state data,
        // the stateCode property from the state entry in MongoDB is deleted.
        delete mergedState.code;

        // Also delete undesired metadata from the MongoDB document.
        delete mergedState._id;
        delete mergedState.__v;

        req.stateData = mergedState;

        next();
    } catch (error) {
        console.error('Error loading state data:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = stateData;
