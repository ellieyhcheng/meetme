'use strict';
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const error = require('errorhandler');
const path = require('path');

const config = require('./config');

var admin = require("firebase-admin");

const cert = JSON.parse(process.env.FIREBASE_CERT)

admin.initializeApp({
	credential: admin.credential.cert(cert),
	databaseURL: "https://meetme-2b31e.firebaseio.com"
});

app.use(cors({
	credentials: true,
	origin: true
}));
app.use(bodyParser.json());

// Set up router endpoints
const eventRouter = require('./routes/event');
const eventController = require('./controller/event');
app.use('/events', eventRouter);

// Handle Errors
app.use(error());

app.use(express.static(path.join(__dirname, "client", "build")))

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
	socket.on('joinEvent', (room) => {
		socket.join(room)
	})

	socket.on('user', (availability, uid, eventId) => {
        eventController.updateAvailabilityHelper(availability, uid, eventId)
            .then((event) => {
                if (event)
                    socket.broadcast.to(eventId).emit('update', event)
                else 
                    console.log("Error writing document");
            })
		
	})

	socket.on('disconnect', () => {
	})
})

server.listen(config.server.port, () => {
	console.log('Listening on port ' + config.server.port);
});
