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

router.get('/', (req, res) => {
  // Execute a SQL query
  console.log("executing an SQL query")
  ibm_db.open(connectionString, (err, conn) => {
    //conn is already open now if err is falsy
    const sql = 'SELECT * FROM FLIGHTS';
    conn.query(sql, (err, data) => {
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
  console.log("executing a POST SQL query")
  const body = req.body

  const QueryOptions = {
    sql : `INSERT INTO FLIGHTS (destination, Starting_des) VALUES (?, ?)`,
    params: [destination = req.body.estination, Starting_des = req.body.Starting_des]

  }
  
  ibm_db.open(connectionString, (err, conn) => {
    
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

module.exports = router;