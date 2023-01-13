import './App.css';
import ChatFace from './ChatInterface/chat'
import React, { useEffect, useState } from 'react'

import axios from 'axios';

const App = () => {

  const [session, setSession] = useState(``)
  
  const createSession = async () => {
    try {
      
      await axios.get(`api/watson/session`).then((result) => {
        setSession(result.data.session_id)
        console.log("Got session!:", session)
      });
      // const data = await response.stringify();
      // setSession(data);
     
    } catch (error) {
      console.log('error getting session', error)
    }
  }
  useEffect(() => {
    console.log("trying to get session ... ")
    
    createSession(); 
    
  }, [0])

  return (
    <div className="App">
      <ChatFace

        session={session}
      />
    </div>
  );
}

export default App;
