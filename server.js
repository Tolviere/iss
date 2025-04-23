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
   // db.run(`INSERT INTO logs (ip, time, student_id) VALUES ('${socket.remoteAddress}', '${new Date()}', ${buffer})`);
  })
  socket.on("end", () => {
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort)
  })
})

function updateLogs(input_id, input_ip) {
  let transit
  let prev_log = db.get(`SELECT * FROM logs WHERE student_id = ${input_id}`)

  if (!prev_log.transit_status || prev_log.transit_status === 'GOING' || prev_log.ip !== input_ip) {
    transit = 'ARRIVED'
  } else if (prev_log.transit_status === 'ARRIVED') {
    transit = 'GOING'
  }

  db.run(`INSERT INTO logs (ip, time, student_id) VALUES ('${input_ip}', '${new Date()}', ${input_id}), '${transit}'`);
}


server.maxConnections = 20
server.listen(59090)


const path = require('path')
const express = require('express')
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
  db.all(`SELECT ip, room_number FROM rooms`, [], (err, rows) => res.json(rows))
})

app.get('/DATA-schedule', (req, res) => {
  db.all(`SELECT student_id, room_nums FROM schedule`, [], (err, rows) => {
    
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
