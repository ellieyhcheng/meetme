import React from 'react';
import './Details.scss';
import moment from 'moment-timezone';

function Details({ event, time, timezone }) {
    const avails = event.availability[time];
    const notAvails = [];
    event.activeUsers.forEach((uid) => {
        if (!avails.includes(uid))
            notAvails.push(uid);
    })

    const getTime = (time) => {
        const m = moment.unix(time).tz(timezone)
        
        if (m.year() === 1971) {
            return m.format('h:mm a on dddd')
        }
        else 
            return m.format('h:mm a on dddd, MMMM D, Y')
    }

    return (
        <div className="details">
            <p className="heading">{avails.length}/{event.activeUsers.length} Available</p>
            <p className="subheading">{getTime(time)}</p>
            <div className="listing">
                <div className="listing-item">
                    <p className="listing-title">Available</p>
                    {avails.map((uid, i) => (
                        <p key={i}>{event.names[uid]}</p>
                    ))}
                </div>
                <div className="listing-item">
                    <p className="listing-title">Unavailable</p>
                    {notAvails.map((uid, i) => (
                        <p key={i}>{event.names[uid]}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Details;
