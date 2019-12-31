var admin = require("firebase-admin");
const db = admin.firestore();

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4());
}

const getEvent = (req, res, next) => {
    db.collection('events').doc(req.params.id).get()
        .then(doc => {
            if (!doc.exists) {
                res.send(null);
                return
            }

            const data = doc.data();
            
            var users = data.users || {};
            var usernames = Object.keys(users);
            
            var names = usernames.reduce((prev, username) => {
                prev[users[username].id] = username;
                return prev
            }, {})
            const event = {
                eventName: data.eventName,
                availability: data.availability,
                activeUsers: data.activeUsers,
                users: data.uids,
                names: names,
            }
            res.json(event);
        })
        .catch(err => {
            console.log(err);
            res.send(null)
        })
}

// Process login
const processLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    
    db.collection('events').doc(req.params.id).get()
        .then(doc => {
            if (!doc.exists) {
                res.send(null);
                return
            }

            const data = doc.data();
            const users = data.users;
            const uids = data.uids;
            
            if (username in users) {
                if (users[username].password === password) {
                    res.send(users[username].id) // successful login
                }
                else {
                    res.send(null); // 
                }
            }
            else {
                // add user
                var newUID = guidGenerator();
                while (uids.includes(newUID)) {
                    newUID = guidGenerator();
                }
                users[username] = {
                    id: newUID,
                    password: password,
                }

                uids.push(newUID);
                
                db.collection("events").doc(req.params.id).update({                   
                    users: users,
                    uids: uids,
                }).then(() => {
                    res.send(newUID)
                })
                .catch (function(error) {
                    console.error("Error writing document: ", error);
                    res.send(null)
                });
            }

        })
        .catch(err => {
            console.log(err);
            res.send(null)
        })
}

// Update availability
const updateAvailability = (req, res, next) => {
    const availability = req.body.availability;
    const uid = req.body.uid;

    const eventId = req.params.id;

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
                    res.send(event.availability);
                })
                .catch(err => {
                    console.log("Error writing document: ", err);
                    res.send(null);
                });
        })
        .catch(err => {
            console.log(err);
            res.send(null)
        })
}

module.exports = {
    getEvent,
    processLogin,
    updateAvailability
};