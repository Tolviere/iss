let net = require('net')
let sqlite3 = require('sqlite3')
let sql;
const db = new sqlite3.Database("./iss.db", sqlite3.OPEN_READWRITE, (err) => {if (err) return console.error(err.message);});

const server = net.createServer((socket) => {
  console.log("Connection from", socket.remoteAddress, "port", socket.remotePort)

  socket.on("data", (buffer) => {
    console.log("Request from", socket.remoteAddress, "port", socket.remotePort)
    console.log(`Input from ${socket.remoteAddress} ${buffer}\n`)
    db.run(`INSERT INTO logs (ip, time, student_id) VALUES ('${socket.remoteAddress}', '${(new Date()).toLocaleString()}', ${buffer})`);
  })
  socket.on("end", () => {
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort)
  })
})

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



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
