var admin = require("firebase-admin");
const express = require('express');
let router = express.Router();
const db = admin.firestore();

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4());
}

router.get('/:id', (req, res, next) => {
    db.collection('events').doc(req.params.id).get()
        .then(doc => {
            const data = doc.data();

            if (!data) 
                next(new Error('Event not found'))
            
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
})

// Process login
router.post('/:id', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    
    db.collection('events').doc(req.params.id).get()
        .then(doc => {
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
                }).then(ref => {
                    res.send(newUID)
                })
                .catch (function(error) {
                    console.error("Error writing document: ", error);
                    res.send(null)
                });
            }

        })
})

router.get('/', (req, res, next) => {
    db.collection('events').get()
        .then(querySnapshot => {
            const data = querySnapshot.docs.map(doc => doc.data());
            res.json(data);
        })
})

module.exports = router;