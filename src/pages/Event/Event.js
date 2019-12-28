import React, { useState, useEffect } from 'react';
import './Event.scss';
import { withRouter } from "react-router-dom";
import Picker from '../../components/Picker/Picker';
import Button from '../../components/Button/Button';
import View from '../../components/View/View';

// 57830400 Generic Monday 00:00 GMT, 57831300 Generic Monday 00:15 GMT

const ev = {
    eventName: 'Cyber Weekly Meeting',
    times: [57891600, 57892500, 57893400, 57894300, 57895200, 57896100, 57897000, 57897900, 
            58064400, 58065300, 58066200, 58067100, 58068000, 58068900, 58069800, 58070700 ],
    // times: [ 1577926800, 1577927700, 1577928600, 1577929500, 1577930400, 1577931300, 1577932200, 1577933100 ],
    
    availability: [ // by slot, filled with people ids
        [1], 
        [2, 3, 1, 4], 
        [3, 1, 4], 
        [4, 3], 
        [],
        [],
        [],
        [],
    ],
    users: [1, 2, 3, 4, 5],
    activeUsers: [1, 2, 3, 4],
    names: {
        1: 'Aaron',
        2: 'Peter',
        3: 'Sanjana',
        4: 'Disha',
        5: 'Test'
    }
}

function Event({match, location}) {
    // console.log(match.params.id)
    const [user, setUser] = useState({username: '', password: ''})
    const [error, setError] = useState('');
    // const [logged, setLogged] = useState(false);
    const [logged, setLogged] = useState(true);

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
            console.log(user)
            login(user.username, user.password)
            setError('')
        }
    }

    const login = (username, password) => {
        if (username === 'test' && password === '') setLogged(true);
        else setLogged(false);
    }


    return (
        <div className="event page">
            <p className="title">{ev.eventName}</p>
            <p className="subheading">to invite people to fill out the form, send them this link: {window.location.host}{match.url}</p>

            <div className="form">
                <div className="panel">
                    {logged ? <Picker event={ev} user={user}/> : (
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
                    <View event={ev}/>
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
    );
}

export default withRouter(Event);
