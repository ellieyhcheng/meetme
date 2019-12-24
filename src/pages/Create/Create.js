import React, { useState } from 'react';
import './Create.scss';
import Calendar from '../../components/Calendar/Calendar'
import Button from '../../components/Button/Button'
import moment from "moment-timezone";

const timeRange = [
    { value: '0', text: 'midnight' },
    { value: '1', text: '1am' },
    { value: '2', text: '2am' },
    { value: '3', text: '3am' },
    { value: '4', text: '4am' },
    { value: '5', text: '5am' },
    { value: '6', text: '6am' },
    { value: '7', text: '7am' },
    { value: '8', text: '8am' },
    { value: '9', text: '9am' },
    { value: '10', text: '10am' },
    { value: '11', text: '11am' },
    { value: '12', text: '12pm' },
    { value: '13', text: '1pm' },
    { value: '14', text: '2pm' },
    { value: '15', text: '3pm' },
    { value: '16', text: '4pm' },
    { value: '17', text: '5pm' },
    { value: '18', text: '6pm' },
    { value: '19', text: '7pm' },
    { value: '20', text: '8pm' },
    { value: '21', text: '9pm' },
    { value: '22', text: '10pm' },
    { value: '23', text: '11pm' },
    { value: '24', text: 'midnight' },
]

function Create() {
    const [type, setType] = useState('date');
    const [dates, setDates] = useState([]);
    const [times, setTimes] = useState({ early: 9, later: 17, timezone: moment.tz.guess() });
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const onChange = (e) => {
        setTimes(oldTimes => (
            {
                ...oldTimes,
                [e.currentTarget.name]: e.currentTarget.value
            }
        ))
    }

    const onSubmit = () => {
        let n = name.toLowerCase();
        let error = '';
        if (n === '') {
            error = 'event name cannot be empty'
        }
        if (n === 'event name') {
            error = `event name cannot be ${name}`
        }
        if (dates.length === 0) {
            error = 'select at least one date or day'
        }

        if (error !== '') {
            setError(error)
        }
        else {
            console.log({ name, dates, times })
            setError('')
        }
    }

    return (
        <div className="create">
            <input
                type="text"
                className="event-name"
                name="event-name"
                placeholder="event name"
                onChange={(e) => setName(e.currentTarget.value)}
                value={name}
            />

            <div className="form">
                <div className="date-selection">
                    <p>select {type === 'date' ? 'dates' : 'days'} that might work</p>
                    <div className="select-wrapper">
                        <select name="type" value={type} onChange={(e) => setType(e.currentTarget.value)}>
                            <option value="date">specific dates</option>
                            <option value="week">days of the week</option>
                        </select>
                    </div>

                    <Calendar type={type} getDates={(dates) => setDates(dates)} />
                </div>

                <div className="time-selection">
                    <p>select time that might work</p>
                    <div className="selection-item">
                        <p>no earlier than: </p>
                        <div className="select-wrapper">
                            <select name="early" value={times.early} onChange={onChange}>
                                {timeRange.map((option) => (
                                    <option value={option.value} key={option.value}>{option.text}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="selection-item">
                        <p>no later than: </p>
                        <div className="select-wrapper">
                            <select name="later" value={times.later} onChange={onChange}>
                                {timeRange.map((option) => (
                                    <option value={option.value} key={option.value}>{option.text}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="selection-item">
                        <p>timezone: </p>
                        <div className="select-wrapper">
                            <select name="timezone" value={times.timezone} onChange={onChange}>
                                {moment.tz.names().map((option, i) => (
                                    <option value={option} key={i}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>


            <div className="create-button">
                <Button onClick={onSubmit}>create event</Button>
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

export default Create;

