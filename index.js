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
var serviceAccount = require("./meetme-2b31e-firebase-adminsdk-cutce-5b9b0b8e78.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://meetme-2b31e.firebaseio.com"
});

app.use(cors({
	credentials: true,
	origin: true
}));
app.use(bodyParser.json());

// Route site index at /
// app.get('/', (req, res) => {
// 	res.send('Connected!')
// })

// Set up router endpoints
const eventRouter = require('./routes/event');
app.use('/events', eventRouter);

// Handle Errors
app.use(error());

// app.use(express.static(path.join(__dirname, "client", "build")))

// app.get("/*", (req, res) => {
//     res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// });

const io = require('socket.io')(server);
const db = admin.firestore();

io.on('connection', (socket) => {
	console.log('a user connected')

	socket.on('joinEvent', (room) => {
		socket.join(room)
	})

	socket.on('user', (availability, uid, eventId) => {
		db.collection('events').doc(eventId).get()
        .then(doc => {
            if (!doc.exists) {
                res.send(null);
                return
            }
            const event = doc.data();
            const times = Object.keys(availability) || [];

            times.forEach(time => {
                if (availability[time].includes(uid)) {
                    if (event.availability[time].includes(uid)) {
                        
                    }
                    else {
                        event.availability[time].push(uid);
                    }
                }
                else {
                    const idx = event.availability[time].indexOf(uid);
                    if (idx !== -1) {
                        event.availability[time].splice(idx, 1);
                    }
                    else {
                        
                    }
                }  
            })

			db.collection("events").doc(eventId).update({availability: event.availability})
				.then(() => {
					socket.broadcast.to(eventId).emit('update', event)
				})
                .catch(err => {
                    console.log("Error writing document: ", err);
                });
        })
        .catch(err => {
            console.log(err);
		})
		
	})

	socket.on('disconnect', () => {
		console.log('user disconnected')
	})
})

server.listen(config.server.port, () => {
	console.log('Listening on port ' + config.server.port);
});
