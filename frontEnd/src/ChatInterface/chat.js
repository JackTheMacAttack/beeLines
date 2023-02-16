import React, { useState } from 'react'
import Calendar from 'react-calendar'
import './chat.css'
import axios from 'axios';

//Things to do: 
// establish sql connection with the db2 database to create an order 
// then give the order number to user

const ChatFace = ({session}) => {
    const [message, setMessage] = useState('');
    const [chatRes, setChatRes] = useState(' ')
    const [calander, revealCalander] = useState(false)
    const [chatlog, setChatLog] = useState([`Hi, I'm Beeverly, virtual assistant for Beeline. How can I help you with your travel plans?`]);
    const [userOptions, setUserOptions] = useState([ {label: "I want a ticket", value: {input: {text: "I want a ticket"}}}, {label: "I want to sell a hat", value: {input: {text: "I want to sell a hat"}}} ])
    const [calVal, setCalVal] = useState(new Date())
    const [Flights, setFlights] = useState([])
    const [seatOptions, setSeatOptions] = useState([])

    const onChange = date => { 
        setCalVal(date)

        const day = calVal.getDate()
        const month = calVal.getMonth() + 1
        const year = calVal.getFullYear()
        const dateToPass = `${year}-${day}-${month} `
        sendMessage(dateToPass, session)
        revealCalander(false)
    }

    


    //checks responses to messages we sen to the api and gets the response type
    const checkResponseType = (WatsonRes, chatMessage) => {
        
        for (let i = 0; i <= WatsonRes.length; i++) {
            const responseData = WatsonRes[i]

            // return a function that corrisponds to what type of response we're getting
            // done: option (minus the part that clears it) and text and calander
            
            switch (responseData.response_type) {
                case "option":
                    showOptions(responseData.options);
                    break;
                case 'text':
                    setChatRes(responseData.text);
                    setChatLog([...chatlog, chatMessage, responseData.text]);
                    break;
                case 'date': 
                    revealCalander(true)
                    break;
                case 'connect_to_agent':
                    console.log('calling agent')
                    break;
                case 'user_defined':
                    const orderData = responseData.user_defined
                    checkUserDef(orderData)
                    break;
                default:
                    console.log('cannot read type or it does not match option or text', responseData.response_type)
                    break;
                        
                    }
                } 
    }


    const checkUserDef = (responseInfo) => {
        console.log('User def response', responseInfo)

        switch (responseInfo.action) {
            case 'settingInfo':
                CheckFlights(responseInfo.values)
                break;
            case 'checkingSeats':
                checkSeats(responseInfo.values)
                break;
            case 'completingOrder': 
                sendOrder(responseInfo.values)
                break;
            default: 
                console.error('could not read response action', responseInfo)
                break;
        }

    }

   
    //if response type is 'options': create an array that can be looped over for response buttons
    const showOptions = (response) => {
        setUserOptions([])
        setUserOptions([...response])
    }
    
    
    const sendMessage = async (chatMessage) => {
        setChatLog([...chatlog, chatMessage]);
        try {
            const body = {input:chatMessage}
            const res = await axios.post(`api/watson/message`, body, { headers: { session_id: session } })  
            const newChatRes = res.data.output.generic
            checkResponseType(newChatRes, chatMessage)
                
        } catch (error) {
            console.error("Error sending message to Watson", error)
        }
    }

    const CheckFlights = async (OrderData) => {
        const body = {
            Destination:OrderData.Destination,
            Origin:OrderData.Origin
        }
        try {
            const res = await axios.get(`api/db2/checkFlight/${body.Destination}/${body.Origin}`)
           
            setFlights(res.data)
          
            
        } catch (error) {
            console.error('error checking flights', error)
        }
        
    }

    const checkSeats = async (flightData) => {
        console.log('flightData', flightData)
        try {
            const res = axios.get(`api/db2/findSeats/${flightData.FLIGHT_ID}`).then((response) => {
                console.log(response)
                setSeatOptions([...response.data])
            })
        } catch (error) {
            console.error('error getting seats', error)
        }
    }

    const submitOrder = async (OrderData) => {
        
        const body = {
            flightId: OrderData.FLIGHT_ID,
            flightDes: OrderData.DESTINATION, 
            flightOrigin : OrderData.ORIGIN,
            flightDate : OrderData.TRIP_DATE
        };
        try {  
            const res = await axios.post(`api/watson/sendingFlight`, body, { headers: { session_id: session } })
            checkResponseType(res.data.output.generic)
            setFlights([])  
        } catch (error) {
            console.error('Error getting flights:', error)
        }
    }

    const sendOrder = async (Order) => {
        
        try {
            const body = {
                flightId: Order.FLIGHT_ID,
                flightDes: Order.destination, 
                flightOrigin : Order.Origin
            }
            console.log(body)
            const res = await axios.post(`api/db2/post`, body).then((response) => {
                console.log(response)
            })
            
        } catch (error) {
           console.error('error sending order', error) 
        }

        
    }

    const checkOrder = (id) => {
        try {
            const res = axios.get(`api/db2/orders/${id}`).then((response) => {
                console.log(response)
            })
        } catch (error) {
            
        }
    }
    
    const handleSubmit = (event, session) => {
        event.preventDefault();
        sendMessage(message, session)
        setMessage('')
    }

    return <div id="chatPage">
        <div id="chatLog">
            {chatlog.map((chat) => {
                return <h1>{chat}</h1>
            })}
            
        </div>
        {
            calander === true ?
            <Calendar 
                // onChange={onChange}
                value={calVal}
                activeStartDate={calVal}
                onClickDay={
                    onChange
                }
            /> : null
        }

        {/* Options for when the response returns with options to make buttons out of */}
        <div class="Buttons-container">
            {userOptions ? 
            userOptions.map((option) => {
                return (
                    <button
                        key={option.id}
                        // type="submit"
                        value={option.value.input.text}
                        onClick={(event) => {
                            event.preventDefault()
                            console.log('clicked:', event.target.value)
                            sendMessage(event.target.value)
                            setUserOptions([])          
                        }}
                        class="options-button"
                    >
                        {option.label}
                    </button>
                )
            }):(
                null
            )}
            {seatOptions ? 
            seatOptions.map((option) => {
                return (
                    <button
                        key={option.id}
                        // type="submit"
                        value={option.SEATNUM}
                        onClick={(event) => {
                            event.preventDefault()
                            console.log('clicked:', event.target.value)
                            sendMessage(event.target.value)
                            setSeatOptions([])          
                        }}
                        class="options-button"
                    >
                        {option.SEATNUM} - {option.SEATTYPE}
                    </button>)
                }): null
            }
        </div>

        <div className="FlightBox">
                {Flights ? 
                Flights.map((flight) => {
                    return (<div> 
                        <h2>{flight.FLIGHT_ID}</h2>
                        <h2>{flight.DESTINATION}</h2>
                        <h2>{flight.STARTING_DES}</h2>
                        <h2>{flight.TRIP_DATE}</h2>
                        <button onClick={(event) => {
                            submitOrder(flight)
                        }}>Buy Ticket</button>

                    </div>)
                }) : null }
        </div>

        <form 
            id="chatInput"
            onSubmit={(event, session) => {
                handleSubmit(event);
            }}
        >   
            <input 
                type="text" 
                placeholder="Ask me anything!" 
                value={message}
                onChange={(event) => {
                    event.preventDefault();
                    setMessage(event.target.value)
                }}/>
        </form>
    </div>
}

export default ChatFace