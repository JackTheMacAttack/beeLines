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
    const [userOptions, setUserOptions] = useState([
        {label: "I want a ticket", value: {input: {text: "I want a ticket"}}},
        {label: "I want to sell a hat", value: {input: {text: "I want to sell a hat"}}}
    ])
    const [calVal, setCalVal] = useState(new Date())

    const onChange = date => { 
        setCalVal(date)

        const day = calVal.getDate()
        const month = calVal.getMonth() + 1
        const year = calVal.getFullYear()
        const dateToPass = `${month} ${day} ${year} `
                    
        console.log('Clicked day!', day, month, year)
        sendMessage(dateToPass, session)
        revealCalander(false)
    }

    


    //checks responses to messages we sen to the api and gets the response type
    const checkResponseType = (WatsonRes, chatMessage) => {
        
        console.log(WatsonRes.title)
        for (let i = 0; i <= WatsonRes.length; i++) {
            const responseData = WatsonRes[i]
            console.log(responseData.response_type)

            // return a function that corrisponds to what type of response we're getting
            // done: option (minus the part that clears it) and text and calander
            
            switch (responseData.response_type) {
                case "option":
                    
                    showOptions(responseData.options);
                    break;
                case 'text':
                    console.log(responseData.text)
                    setChatRes(responseData.text);
                    setChatLog([...chatlog, chatMessage, responseData.text]);
                    break;
                case 'date': 
                    console.log(responseData)
                    revealCalander(true)
                    break;
                case 'connect_to_agent':
                    console.log('calling agent')
                    break;
                case 'user_defined':
                    console.log(responseData.user_defined.Destination)
                    const orderData = responseData.user_defined
                    submitOrder(orderData)
                    console.log('SQL Data', orderData)
                    break;
                default:
                    console.log('cannot read type or it does not match option or text', responseData.response_type)
                    break;
                        
                    }
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
            const res = await axios.post(`api/watson/message`, body, {
                headers: {
                    session_id: session
                }
            })
            .then((response) => {
                console.log(response)
                const newChatRes = response.data.output.generic
                checkResponseType(newChatRes, chatMessage)
                
            }).catch(err => {console.log(err)})  
        } catch (error) {
            console.log("Error sending message", error)
        }
    }

    const submitOrder = async (OrderData) => {
        console.log('Submitting order', OrderData)
        try {
            const body = OrderData
            const res = await axios.post(`api/db2/post`, body)
            .then((response) => {
                console.log(response)
                
            }).catch(err => {console.log(err)})  
            console.log(res)
            
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
        <div>
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
                    >
                        {option.label}
                    </button>
                )
            }):(
                null
            )}
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