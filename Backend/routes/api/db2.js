const express = require('express');
const router = express.Router();
const ibm_db = require('ibm_db')

//DB2 connection details
const host = process.env.db2_host;
const port = process.env.db2_PORT;
const username = process.env.db2_use;
const password = process.env.db2_pass;
const database = process.env.database_name;

//  connection string
const connectionString = `DATABASE=${database};HOSTNAME=${host};PORT=${port};PROTOCOL=TCPIP;UID=${username};PWD=${password};Security=SSL;`;

// Connect to the database
const conn = new ibm_db.Database();

router.get('/checkFlight/:Destination/:Origin', (req, res) => {
  ibm_db.open(connectionString, (err, conn) => {

    const QueryOptions = { 
      sql : `SELECT * FROM FLIGHTS WHERE(Destination, Origin) = (?, ?)`,
      params : [
        Destination = req.params.Destination, 
        Origin = req.params.Origin
        // Trip_date = req.body.LeaveDate.value
        // destination = 'Dallas, TX (DFW)', 
        // origin = 'Houston, TX (IAH)'
      ]


    }
    console.log(QueryOptions)
    conn.query(QueryOptions, (err, data) => {
      if (err) {
        
        console.error('Error executing SQL: ', err);
        res.sendStatus(500);
      } else {
        console.log('Sending SQL data!', data)
        res.send(data);
      }
        
      
    });
    
  });
});

//now sending a post request
router.post('/post', (req, res) => {
  
  
  ibm_db.open(connectionString, (err, conn) => {

    const QueryOptions = {
      sql : `INSERT INTO ORDERS (destination, origin, flight_ID) VALUES (?, ?, ?)`,
      params: [ 
        destination = req.body.flightDes, 
        origin = req.body.flightOrigin,
        flight_ID = req.body.flightId
      ]
  
    }

    console.log("Query options for order", QueryOptions)

    conn.query(QueryOptions, (err, data) => {
      if (err) {    
        console.error('Error executing SQL: ', err);
        res.sendStatus(500);
      } else {
        console.log('Sending SQL data!', data)
        res.send(data);
      }  
    });
  })
})


router.patch('/update', (req, res) => {
  console.log('MAking an update request')
  const sql = `UPDATE FLIGHTS SET DESTINATION = 'Chicago Il' WHERE ID = 1`

  ibm_db.open(connectionString, (err, conn) => {
    
    conn.query(sql, (err, data) => {
      if (err) {    
        console.error('Error executing SQL: ', err);
        res.sendStatus(500);
      } else {
        console.log('Sending SQL data!', data)
        res.send(data);
      }  
    });
  })
})


//this is mainy here for when we need to fill a specific table
router.post('/fillTable', (req, res) => {

  const destinations = ["Houston, TX (IAH)", "Dallas, TX (DFW)", "Jackson, MS (JAN)", "New Orleans, LA (MSY)", "Little Rock, AR (CNA)", "New York, NY (JFK)", "Los Angeles, CA (LAX)", "Detroit, MI (DTW)", "Las Vegas, NV (LAS)", "Orlando, FL (MCO)", "Miami, FL (MIA)", "Monroe, LA (MLU)", "Atlanta, GA (ATL)", "Chicago, IL (ORD)" ]
  const origins = ["Houston, TX (IAH)", "Dallas, TX (DFW)", "Jackson, MS (JAN)", "New Orleans, LA (MSY)", "Little Rock, AR (CNA)", "New York, NY (JFK)", "Los Angeles, CA (LAX)", "Detroit, MI (DTW)", "Las Vegas, NV (LAS)", "Orlando, FL (MCO)", "Miami, FL (MIA)", "Monroe, LA (MLU)", "Atlanta, GA (ATL)", "Chicago, IL (ORD)" ]
  
  const randomDate = (start, end) => { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0] }

  ibm_db.open(connectionString, (err, conn) => { 
    for(i = 0; i < 100; i++) {
      DateToFly = randomDate(new Date(), new Date(2023, 3, 31))
      const QueryOptions = {
        sql : `INSERT INTO FLIGHTS (destination, origin, Trip_date) VALUES (?, ?, ?)`,
        params: [ 
          destination = destinations[Math.floor(Math.random() * destinations.length)], 
          origin = origins[Math.floor(Math.random() * origins.length)],
          Leave_date = DateToFly
        ]
      }
      conn.query(QueryOptions, (err, data) => {
        if (err) {    
          console.error('Error executing SQL: ', err);
          res.sendStatus(500);
        } else {
          console.log('Sending SQL data!', data)
          res.send(data);
        }  
      });


      }
  })


}

)


router.get('/findSeats/:FLIGHT_ID', (req, res) => {
  ibm_db.open(connectionString, (err, conn) => { 

      const QueryOptions = {
        sql : `SELECT * FROM SEATS WHERE SeatNum NOT IN (SELECT seatNum FROM TICKETS WHERE (flight_id) = (?))`,
        
        params: [ 
          flight_id = req.params.FLIGHT_ID
        ]
      }

      conn.query(QueryOptions, (err, data) => {
        if (err) {    
          console.error('Error executing SQL: ', err);
          res.sendStatus(500);
        } else {
          console.log('Sending SQL data!', data)
          res.send(data);
        }  
      });


  })
})

module.exports = router;