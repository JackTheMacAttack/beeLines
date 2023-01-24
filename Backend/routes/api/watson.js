// Import Dependencies 
const express = require('express');
const router = express.Router();
const AssistantV2 = require('ibm-watson/assistant/v2');
const {IamAuthenticator} = require('ibm-watson/auth');

//Create Instance of Assistant 

const assistant = new AssistantV2({
    version: '2021-11-27',
    authenticator: new IamAuthenticator({
      apikey: process.env.WATSON_ASSISTANT_APIKEY,
    }),
    serviceUrl: process.env.WATSON_ASSISTANT_URL,
  });

//Route to handle session tokens
//GET REQUESTS 
router.get("/session", async (req, res) => {
    try {
        // console.log("Got Session!")
        const session = await assistant.createSession({
            assistantId:process.env.WATSON_ASSISTANT_ID
        })
        res.json(session['result'])
    } catch (err) {
        console.log("There was an error ... ")
        res.send("There was an error processing your request.");
        console.log(err);
    }
})

//Handle Messages
router.post('/message', async (req,res) => {

    console.log('Trying to send message')
    
    try {
        console.log("message Sent!")
        const message = await assistant.message({
            assistantId: process.env.WATSON_ASSISTANT_ID,
            sessionId: req.headers.session_id,
            input: {
                message_type:"text",
                text: req.body.input
            }
        });
        res.json(message['result'])
    } catch (err) {
        console.log("There was an error with sending a message... ")
        res.send("There was an error processing your request.");
        console.log(err);
    }

})

//route to get flight information when sending a ticket request
router.post('/sendingFlight', async (req,res) => {

    console.log('sending flight data')
    
    // context.set('flightId', '31')
    try {
        console.log("flight variables sent!")

        const message = await assistant.message({
            assistantId: process.env.WATSON_ASSISTANT_ID,
            sessionId: req.headers.session_id,
            context: {
                'skills': {
                    'main skill': {
                        'user_defined': {

                            'flightId': req.body.flightId,
                            'flightDes': req.body.flightDes, 
                            'flightOrigin' : req.body.flightOrigin,
                            'flightDate' : req.body.flightDate
                        }
                    }
                }
            },
            input: {
                message_type:"text",
                text: 'sending info'
            }
        });
        res.json(message['result'])
    } catch (err) {
        console.log("There was an error with sending a message... ")
        res.send("There was an error processing your request.");
        console.log(err);
    }

})

//Export Routes
module.exports = router