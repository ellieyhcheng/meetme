import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Event.scss';
import { withRouter } from "react-router-dom";
import Picker from '../../components/Picker/Picker';
import Button from '../../components/Button/Button';
import View from '../../components/View/View';
import { withAPI } from "../../components/API";
import io from 'socket.io-client';
import moment from "moment-timezone";
import Details from '../../components/Details/Details';

// 57830400 Generic Monday 00:00 GMT, 57831300 Generic Monday 00:15 GMT

function Event({match, location, history, API}) {
    const [user, setUser] = useState({username: '', password: '', uid: ''})
    const [error, setError] = useState('');
    const [logged, setLogged] = useState(false);
    const [event, setEvent] = useState(null);
    const [updateView, setUpdateView] = useState(false);
    const [timezone, setTimezone] = useState(moment.tz.guess());
    const [details, setDetails] = useState(null);

    const socket = useRef(null)

    useEffect(() => {
        document.title = (event ? event.eventName : '') + '- MeetMe';
    }, [event])

    useEffect(() => {
        socket.current = io()

        socket.current.emit('joinEvent', match.params.id);

        socket.current.on('update', (event) => {
            console.log(event)
            setEvent(event);
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
            }
            else
                {
                    let count = 3;
                    setInterval(() => {
                        if (count >= 0) {
                            setError(`event not found... redirecting you in ${count}`)
                            count--;
                        }
                    }, 1000)
                    setTimeout(() => {
                        history.replace('/')
                    }, 4000)
                }
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
        setEvent(event => {
            const availability = event.availability;
            const activeUsers = event.activeUsers;
            var active = false;
            Object.keys(availability).forEach(time => {
                const idx = availability[time].indexOf(user.uid);
                if (idx !== -1) {
                    if (actives.includes(time)) {
                        active = true;
                    } 
                    else {
                        availability[time].splice(idx, 1);
                    }
                }
                else {
                    if (actives.includes(time)) {
                        availability[time].push(user.uid);
                        active = true;
                    }
                }
            })
            
            let idx = activeUsers.indexOf(user.uid)
            if (active) {
                // add this user to active user if not in there already
                if (idx === -1) {
                    activeUsers.push(user.uid);
                }
            }
            else {
                if (idx !== -1) {
                    activeUsers.splice(idx, 1);
                }
            }

            socket.current.emit('user', availability, user.uid, match.params.id)

            return {
                ...event,
                availability,
                activeUsers
            };
        })
        setUpdateView(old => !old);
        
    }, [user.uid, match.params.id, socket])

    return (
        event ? (
        <div className="event page">
            <p className="title">{event.eventName}</p>
            <p className="subheading">To invite people to fill out the form, send them this link: {window.location.host}{match.url}</p>
            {moment(Object.keys(event.availability)[0]).year() !== 1971 &&
                <div className="timezone">
                    <p>Your timezone: </p>
                    <div className="select-wrapper">
                        <select name="type" value={timezone} onChange={(e) => setTimezone(e.currentTarget.value)}>
                            {moment.tz.names().map((option, i) => (
                                <option value={option} key={i}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>
            }
            
            <div className="form">
                <div className="panel">
                    {details ? (
                        <Details event={event} time={details} timezone={timezone}/>
                    ) : (
                        logged ? (
                            <Picker availability={event.availability} user={user} getAvailability={getAvailability} timezone={timezone}/> 
                        ) : (
                            <div className="login">
                                <p className="heading">Who are you?</p>
                                <p className="subheading">If new to this event, make up a password (if you'd like)</p>
    
                                <div className="userform">
                                    <div className="item">
                                        <p>Name: </p>
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
                                        <p>Password (optional): </p>
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
                        )
                    )}
                </div>
                
                <div className="panel">
                    <View 
                        availability={event.availability} 
                        numUsers={event.activeUsers.length} 
                        update={updateView} 
                        timezone={timezone}
                        showDetails={(time) => setDetails(time)}
                        hideDetails={() => setDetails(null)}/>
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
        ) : (
            <div className="event page">
                    {error !== '' && 
                        <div className="error-screen" onClick={() => setError('')}>
                            <div className="error">
                                <p>{error}</p>
                            </div>
                        </div>
                    }
            </div>
        )
    );
}

export default withAPI(withRouter(Event));
