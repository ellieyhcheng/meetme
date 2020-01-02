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
            
            res.json(getEventHelper(data));
        })
        .catch(err => {
            console.log(err);
            res.send(null)
        })
}

const getEventHelper = (event) => {
    var users = event.users || {};
    var usernames = Object.keys(users);
    
    var names = usernames.reduce((prev, username) => {
        prev[users[username].id] = username;
        return prev
    }, {})
    const ev = {
        eventName: event.eventName,
        availability: event.availability,
        activeUsers: event.activeUsers,
        users: event.uids,
        names: names,
    }
    return ev
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

    updateAvailabilityHelper(availability, uid, eventId)
        .then((event) => {
            res.send(event);
        })
}

const updateAvailabilityHelper = (availability, uid, eventId) => {
    return db.collection('events').doc(eventId).get()
        .then(doc => {
            if (!doc.exists) {
                res.send(null);
                return
            }
            const event = doc.data();
            const times = Object.keys(availability) || [];
            var active = false;

            times.forEach(time => {
                if (availability[time].includes(uid)) {
                    active = true;
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

            let idx = event.activeUsers.indexOf(uid) 
            if (active) {
                // add this user to active user if not in there already
                if (idx === -1) {
                    event.activeUsers.push(uid);
                }
            }
            else {
                if (idx !== -1) {
                    event.activeUsers.splice(idx, 1);
                }
            }

            return db.collection("events").doc(eventId).update({availability: event.availability, activeUsers: event.activeUsers})
                .then(() => {
                    return getEventHelper(event)
                })
                .catch(err => {
                    console.log("Error writing document: ", err);
                });
        })
        .catch(err => {
            console.log(err);
        })
}

const createEvent = (req, res, next) => {
    const {eventName, availability} = req.body;

    const event = {
        eventName,
        availability: availability,
        activeUsers: [],
        uids: [],
        users: {},
    }

    db.collection('events').add(event)
        .then(ref => {
            console.log('Added document with ID: ', ref.id);
            res.send(ref.id);
        })
        .catch (function(error) {
            console.error("Error writing document: ", error);
            res.send(null);
        });
}

module.exports = {
    getEvent,
    processLogin,
    updateAvailability,
    updateAvailabilityHelper,
    createEvent
};