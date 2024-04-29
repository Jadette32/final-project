const State = require('../model/States');

const data = {
    states: require('../model/statesData.json'),
    setStates: function(data) { this.states = data }
};

const addEntry = async () => {
    try {
        const statePromises = Object.keys(data.states).map(async (stateKey) => {
            const state = data.states[stateKey];
            const fact = await State.findOne({ stateCode: state.code }).exec();
            if (fact) {
                state.funfacts = fact.funfacts;
            }
        });
        await Promise.all(statePromises);
        console.log("Fun facts added successfully.");
    } catch (err) {
        console.error("Error adding fun facts:", err);
    }
}

addEntry();


const getAllStates = async(req, res) => {
    if (req.query) {
        if (req.query.contig == 'true') {
            const result = data.states.filter(st => st.code != "AK" && st.code != "HI");
            res.json(result);
            return;
        } else if (req.query.contig == 'false') {
            const result = data.states.filter(st => st.code == "AK" || st.code == "HI");
            res.json(result);
            return;
        }
    }
    res.json(data.states);
}

const getState = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find(st => st.code == code);
    if (!state) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }
    res.json(state);
}

const getCapital = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find(st => st.code == code);
    if (!state) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }
    res.json({ "state": state.state, "capital": state.capital_city });
}

 // get individual state and its nickname
 const getNickname = (req,res)=> {
     // get the state code and convert it to uppercase
     const code = req.params.state.toUpperCase();
    // search code
    const state = data.states.find( st => st.code == code); 
    if(!state){ 
        // code not found error message
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    //for valid code, send state and nickname
    res.json({"state": state.state, "nickname": state.nickname}); 

 }

 // get individual state and population
 const getPopulation = (req,res)=> {
     // get the state code and convert it to uppercase
    const code = req.params.state.toUpperCase();
    // search code
    const state = data.states.find( st => st.code == code); 
    if(!state){
        // code not found error message
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    // for valid code send state and poulation
    res.json({"state": state.state, "population": state.population.toLocaleString("en-US")}); 
 }

 // get individual state and admission date
 const getAdmission = (req,res)=> {

     // get the state code and convert it to uppercase
     const code = req.params.state.toUpperCase();
    // search code
    const state = data.states.find( st => st.code == code); 
    if(!state){
        // code not found error message
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    // for valid code, send state and admission date
    res.json({"state": state.state, "admitted": state.admission_date}); 
 }

 // get a random fun fact for individual state
 const getFunFact = (req,res)=>{
     // get the state code and convert to uppercase
     const code = req.params.state.toUpperCase();
    // search code
    const state = data.states.find( st => st.code == code);
    if(!state){ 
        // code not found error message
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    if(state.funfacts){ 
        // for states containing funfacts property- send random
         res.status(201).json({"funfact": state.funfacts[Math.floor((Math.random()*state.funfacts.length))]});
    } 
    else
    {
        // funfacts not found error message
        res.status(201).json({"message": `No Fun Facts found for ${state.state}`}); 
    }
}

// create funfacts for individual state
const createFunFact = async (req,res)=>{
    // state code not found
    if (!req?.params?.state){ 
        return res.status(400).json({'message': 'Invalid state abbreviation parameter'});
    }
    // no value found
    if(!req?.body?.funfacts){

        return res.status(400).json({"message": "State fun facts value required"});
    }
    if(!Array.isArray(req.body.funfacts)) { 
        // value found, but not an array
        return res.status(400).json({'message': "State fun facts value must be an array"});
    }

     // get the state code and convert it to uppercase
     const code = req.params.state.toUpperCase();

    try {
        // create funfacts property for new values
       if(!await State.findOneAndUpdate({stateCode: code},{$push: {"funfacts": req.body.funfacts}})){   
            await State.create({ 
                stateCode: code,
                funfacts: req.body.funfacts
             });
        } 
        const result = await State.findOne({stateCode: code}).exec();

        // success- provide status code
        res.status(201).json(result); 
    } catch (err) {console.error(err);}   

    // update json data
    addEntry(); 
}

// update fun fact for individual state
const updateFunFact = async (req,res)=>{
    if(!req?.params?.state){ 
        // check code
        return res.status(400).json({'message': 'Invalid state abbreviation parameter'});
    }
    if(!req?.body?.index) 
        // check for index to be updated
    {
        // no index provided error message
        return res.status(400).json({"message": "State fun fact index value required"});
    }
    if(!req?.body?.funfact){
        // no fun fact value error message
        return res.status(400).json({"message": "State fun fact value required"});
    }

     // get the state code and convert it to uppercase
     const code = req.params.state.toUpperCase();
    // search code
    const state = await State.findOne({stateCode: code}).exec(); 
    const jstate = data.states.find( st => st.code == code);

    let index = req.body.index;
    // for empty array
    if (!jstate.funfacts || index-1 == 0)
    {
        // send error message
        return res.status(400).json({"message": `No Fun Facts found for ${jstate.state}`});
    }

    if(index > state.funfacts.length || index < 1 || !index){ 
        // check if index holds value
        const state = data.states.find( st => st.code == code);
        // for empty index
        return res.status(400).json({"message": `No Fun Fact found at that index for ${jstate.state}`});
    }
    // index decrement
    index -= 1; 

    // replace index 
    if (req.body.funfact) state.funfacts[index] = req.body.funfact; 
    const result = await state.save();

    // success- send status code
    res.status(201).json(result);

    // update json data
    addEntry(); 
}   


const deleteFunFact = async(req, res) => {
    if (!req.params.state || !req.body.index) {
        return res.status(400).json({ 'message': 'Invalid state abbreviation parameter or index' });
    }

    const code = req.params.state.toUpperCase();
    const state = await State.findOne({ stateCode: code }).exec();
    const jstate = data.states.find(st => st.code == code);

    let index = req.body.index;
    if (!jstate.funfacts || index - 1 == 0) {
        return res.status(400).json({ "message": `No Fun Facts found for ${jstate.state}` });
    }

    index -= 1;

    state.funfacts.splice(index, 1);
    await state.save();

    addEntry();
    res.status(200).json({ "message": "Fun fact deleted successfully" });
}
 module.exports={getAllStates, getState, getNickname, getPopulation, getCapital, getAdmission, getFunFact, createFunFact, updateFunFact,deleteFunFact};