import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Event.scss';
import { withRouter } from "react-router-dom";
import Picker from '../../components/Picker/Picker';
import Button from '../../components/Button/Button';
import View from '../../components/View/View';
import { withAPI } from "../../components/API";
import io from 'socket.io-client';

// 57830400 Generic Monday 00:00 GMT, 57831300 Generic Monday 00:15 GMT

function Event({match, location, history, API}) {
    const [user, setUser] = useState({username: '', password: '', uid: ''})
    const [error, setError] = useState('');
    const [logged, setLogged] = useState(false);
    const [event, setEvent] = useState(null);
    const [availability, setAvailability] = useState({});
    const [updateView, setUpdateView] = useState(false);

    const socket = useRef(null)

    useEffect(() => {
        socket.current = io('http://localhost:3000')

        socket.current.emit('joinEvent', match.params.id);

        socket.current.on('update', (event) => {
            console.log(event)
            setAvailability(event.availability)
            setUpdateView(old => !old)
        })
        
        return () => {
            socket.current.disconnect()
        }
    }, [match.params.id])

    useEffect(() => {
        const eventId = match.params.id;
        API.getEvent(eventId)
        .then(data => {
            if (data) {
                setEvent(data);
                setAvailability(data.availability);
            }
            else
                history.replace('/')
        })
    }, [match, history, API])

    const onChange = (e) => {
        let input = e.currentTarget;
        setUser(user => (
            {
                ...user,
                [input.name]: input.value
            }
        ))
    }

    const onSubmit = () => {
        let error = '';
        if (user.username === '') {
            error = 'Your name cannot be empty'
        }

        if (error !== '') {
            setError(error)
        }
        else {
            const eventId = match.params.id;

            API.processLogin(eventId, {username: user.username, password: user.password})
                .then(uid => {
                    if (uid) {
                        setUser(user => {
                            return {
                                ...user,
                                uid
                            }
                        });
                        setLogged(true);
                        setError('')
                    }
                    else {
                        setError('Wrong password')
                        setLogged(false);
                    }
                })
        }
    }

    const getAvailability = useCallback((actives) => {
        setAvailability(availability => {
            Object.keys(availability).forEach(time => {
                const idx = availability[time].indexOf(user.uid);
                if (idx !== -1) {
                    if (actives.includes(time)) {

                    } 
                    else {
                        availability[time].splice(idx, 1);
                    }
                }
                else {
                    if (actives.includes(time)) {
                        availability[time].push(user.uid);
                    }
                }
            })
            socket.current.emit('user', availability, user.uid, match.params.id)

            return availability;
        })
        setUpdateView(old => !old);
        
    }, [user.uid, match.params.id, socket])

    return (
        event ? (
        <div className="event page">
            <p className="title">{event.eventName}</p>
            <p className="subheading">to invite people to fill out the form, send them this link: {window.location.host}{match.url}</p>

            <div className="form">
                <div className="panel">
                    {logged ? <Picker event={event} user={user} getAvailability={getAvailability}/> : (
                        <div className="login">
                            <p className="heading">who are you?</p>
                            <p className="subheading">if new to this event, make up a password (if you'd like)</p>

                            <div className="userform">
                                <div className="item">
                                    <p>name: </p>
                                    <input
                                        type="text"
                                        className="username"
                                        name="username"
                                        required
                                        onChange={(e) => onChange(e)}
                                        value={user.username}
                                    />
                                </div>

                                <div className="item">
                                    <p>password (optional): </p>
                                    <input
                                        type="password"
                                        className="password"
                                        name="password"
                                        onChange={onChange}
                                        value={user.password}
                                    />
                                </div>
                            </div>
                            <div className="submit-button">
                                <Button onClick={onSubmit}>Submit</Button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="panel">
                    <View availability={availability} numUsers={event.activeUsers ? event.activeUsers.length : 0} update={updateView}/>
                </div>
            </div>
            {error !== '' && 
                <div className="error-screen" onClick={() => setError('')}>
                    <div className="error">
                        <p>{error}</p>
                        <Button onClick={() => setError('')}>Ok</Button>
                    </div>
                </div>
            }
        </div>
        ) : <div className="event page"></div>
    );
}

export default withAPI(withRouter(Event));
