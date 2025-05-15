let net = require('net') 
let sqlite3 = require('sqlite3') 
let sql; 
const db = new sqlite3.Database("./iss.db", sqlite3.OPEN_READWRITE, (err) => {if (err) return console.error(err.message);}); 

const server = net.createServer((socket) => { 
  console.log("Connection from", socket.remoteAddress, "port", socket.remotePort) 

  socket.on("data", (buffer) => { 
    updateLogs(buffer, socket.remoteAddress) 
/* 

    let prev_log = db.get(`SELECT * FROM logs WHERE student_id = ${buffer}`) 

    if (!prev_log.transit_status || prev_log.transit_status === 'GOING' || prev_log.ip === socket.remoteAddress) 

    */ 

    console.log("Request from", socket.remoteAddress, "port", socket.remotePort) 
    console.log(`Input from ${socket.remoteAddress} ${buffer}\n`) 

    //db.run(`INSERT INTO logs (ip, time, student_id) VALUES ('${socket.remoteAddress}', '${new Date()}', ${buffer})`); 
  }) 

  socket.on("end", () => { 
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort) 
  }) 
}) 

function updateLogs(input_id, input_ip) { 
  db.get(`SELECT * FROM logs WHERE student_id = ${input_id} ORDER BY id DESC`, [], (err, prev_log) => {
    db.get(`SELECT * FROM rooms WHERE ip = '${input_ip}' ORDER BY id DESC`, [], (err, room) => {

      let room_num = 'ROOM NUMBER'
      if (room) {
        room_num = room.room_number
      } 

      let transit
      if (!prev_log || !prev_log.transit_status || prev_log.transit_status === 'undefined' || prev_log.room !== room_num) { 
          transit = 'ARRIVED' 
      } else if (prev_log.transit_status === 'GOING' && room_num === prev_log.room) { 
          transit = 'RETURNED' 
      } else if ((prev_log.transit_status === 'ARRIVED' || prev_log.transit_status === 'RETURNED') && room_num === prev_log.room) { 
          transit = 'GOING' 
      } 

      db.run(`INSERT INTO logs (ip, time, student_id, transit_status, room) VALUES ('${input_ip}', '${new Date()}', ${input_id}, '${transit}', '${room_num}')`); 
    })
  })
} 

server.maxConnections = 20 
server.listen(59090) 
 
const path = require('path') 
const express = require('express'); 
const { reverse } = require('dns');
const app = express() 
const port = 3000 

app.use(express.json()) 
app.use(express.static('public')) 
app.get('/DATA-full-logs', (req, res) => { 
  //res.sendFile(path.join(__dirname, 'index.html')) 
db.all(`SELECT * FROM logs`, [], (err, rows) => { 
    res.json((rows)) 
  }) 
}) 

app.get('/DATA-names', (req, res) => { 
  db.all(`SELECT student_id, name FROM names`, [], (err, rows) => res.json(rows)) 
}) 

app.get('/DATA-room-nums', (req, res) => { 
  db.all(`SELECT ip, room_number FROM rooms ORDER BY id DESC`, [], (err, rows) => res.json(rows)) 
}) 

app.get('/DATA-transit', (req, res) => {
  db.all(`SELECT * FROM logs WHERE id IN (SELECT max(id) FROM logs GROUP BY student_id)`, [], (err, rows) => res.json(rows))
})

app.get('/DATA-transit-going', (req, res) => { 
  db.all(`SELECT * FROM logs WHERE id IN (SELECT max(id) FROM logs GROUP BY student_id) AND transit_status = 'GOING'`, [], (err, rows) => res.json(rows)) 
}) 

 

app.get('/DATA-transit-returned', (req, res) => { 
  db.all(`SELECT * FROM logs WHERE id IN (SELECT max(id) FROM logs GROUP BY student_id) AND transit_status = 'RETURNED'`, [], (err, rows) => res.json(rows)) 
}) 

 

app.listen(port, () => { 
  console.log(`Example app listening on port ${port}`) 
}) 