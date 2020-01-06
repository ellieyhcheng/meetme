import React, { useState } from 'react';
import './Create.scss';
import Calendar from '../../components/Calendar/Calendar'
import Button from '../../components/Button/Button'
import moment from "moment-timezone";
import { withAPI } from '../../components/API';
import { withRouter } from 'react-router-dom';

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

function Create({ API, history }) {
    const [type, setType] = useState('date');
    const [dates, setDates] = useState([]);
    const [times, setTimes] = useState({ early: 9, later: 17, timezone: moment.tz.guess() });
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [warning, setWarning] = useState(false);

    useState(() => {
        setWarning(window.innerWidth <= 800);
    }, [window.innerWidth])

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
            error = 'Event name cannot be empty'
        }
        if (n === 'event name') {
            error = `Event name cannot be ${name}`
        }
        if (dates.length === 0) {
            error = 'Select at least one date or day'
        }
        dates.forEach(date => {
            if (moment(date, 'Y-MM-D').isBefore(moment(), 'day'))
                error = 'Dates must be today or after'
        })

        if (error !== '') {
            setError(error)
        }
        else {
            var availability = {}

            if (type === 'week') {
                dates.forEach(date => {
                    var day = date.split('-')[1];
                    if (day === '0') day = '7';
                    for (let i = times.early; i < times.later; i++) {
                        for (let j = 0; j < 60; j += 15) {
                            const m = moment.tz(`1971-11-${day} ${i}:${j}:00`, 'YYYY-MM-D H:m:ss', times.timezone);
                            availability[m.unix()] = []
                        }
                    }
                })
            }
            else {
                dates.forEach(date => {
                    for (let i = times.early; i < times.later; i++) {
                        for (let j = 0; j < 60; j += 15) {
                            const m = moment.tz(`${date} ${i}:${j}:00`, 'YYYY-MM-D H:m:ss', times.timezone);
                            availability[m.unix()] = []
                        }
                    }
                })
            }

            API.createEvent(name, availability)
                .then(eventId => {
                    if (eventId)
                        history.push(`/${eventId}`);
                    else {
                        setError('could not create event. network error')
                    }
                })

            setError('')
        }
    }

    return (
        <div className="create page">
            <input
                type="text"
                className="event-name"
                name="event-name"
                placeholder="event name"
                onChange={(e) => setName(e.currentTarget.value)}
                value={name}
            />
            {warning &&
                <p className="description">For a better experience, turn your device to landscape. Or not.</p>
            }

            <div className="form">
                <div className="date-selection">
                    <p className="heading">Select {type === 'date' ? 'dates' : 'days'} that might work</p>
                    <p className="subheading">Click and drag to choose possible {type === 'date' ? 'dates' : 'days'}</p>
                    <div className="select-wrapper">
                        <select name="type" value={type} onChange={(e) => setType(e.currentTarget.value)}>
                            <option value="date">Specific Dates</option>
                            <option value="week">Days of the Week</option>
                        </select>
                    </div>

                    <Calendar type={type} getDates={(dates) => setDates(dates)} />
                </div>

                <div className="time-selection">
                    <p className="heading">Select time that might work</p>
                    <div className="selection-items">
                        <div className="item">
                            <p>No earlier than: </p>
                            <div className="select-wrapper">
                                <select name="early" value={times.early} onChange={onChange}>
                                    {timeRange.map((option) => (
                                        <option value={option.value} key={option.value}>{option.text}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="item">
                            <p>No later than: </p>
                            <div className="select-wrapper">
                                <select name="later" value={times.later} onChange={onChange}>
                                    {timeRange.map((option) => (
                                        <option value={option.value} key={option.value}>{option.text}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {type !== 'week' &&
                            <div className="item">
                                <p>Timezone: </p>
                                <div className="select-wrapper">
                                    <select name="timezone" value={times.timezone} onChange={onChange}>
                                        {moment.tz.names().map((option, i) => (
                                            <option value={option} key={i}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        }
                    </div>
                    {type === 'week' && 
                            <div className="timezone-alt">
                                <p>Days of the week events assume participants are in the same timezone</p>
                            </div>
                        }
                </div>

            </div>

            <div className="create-button">
                <Button onClick={onSubmit}>Create Event</Button>
            </div>

            {error !== '' &&
                <div className="error-screen" onClick={() => setError('')}>
                    <div className="error" onClick={e => e.stopPropagation()}>
                        <p>{error}</p>
                        <Button onClick={() => setError('')}>Ok</Button>
                    </div>
                </div>
            }
        </div>
    );
}

export default withAPI(withRouter(Create));

