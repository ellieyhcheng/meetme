import React, { useState, useEffect } from 'react';
import './View.scss';
import moment from 'moment-timezone';
import { colorGradient } from "../../utils";

function View({availability={}, numUsers=0, timezone, showDetails, hideDetails}) {
    const [avails, setAvails] = useState(Object.values(availability));
    const times = Object.keys(availability);
    
    var columns = [];
    var days = [];
    var dates = [];
    var hours = [];
    var colors = colorGradient('#FFFFFF', '#000000', numUsers + 1)

    if (times.length !== 0) {
        let col = [];

        for (let i = 0; i < times.length - 1; i++) {
            col.push(times[i])
            if (times[i + 1] - times[i] !== 900) {
                let m = moment.unix(times[i])
                if (m.year() !== 1971) {
                    dates.push(m.tz(timezone).format('MMM D'))
                }
                days.push(m.format('dd')[0])
                columns.push(col);
                col = [];
            }
        }
        let m = moment.unix(times[times.length - 1])
        if (m.year() !== 1971) {
            dates.push(m.tz(timezone).format('MMM D'))

        }
        days.push(m.format('dd')[0])
        col.push(times[times.length - 1])
        columns.push(col);

        const idx = times.length / columns.length;
        hours = [...times.slice(0, idx), (parseInt(times[idx - 1]) + 900).toString()]
    }

    const getHour = (time) => {
        let hour = moment.unix(time).tz(timezone).format('h a')
        if (hour === '12 am') return 'midnight';
        if (hour === '12 pm') return 'noon';
        return hour;
    }

    useEffect(() => {
        setAvails(Object.values(availability))
    }, [availability])

    return (
        <div className="view noselect">
            <p className="heading">Everyone's availability</p>

            <div className="legend">
                <p>0/{numUsers} available</p>
                    
                <div className="gradient">
                    {[...new Array(numUsers + 1)].map((user, i) => (
                        <div className="box" key={i} style={{background: colors[i]}}></div>
                    ))}
                </div>
                <p>{numUsers}/{numUsers} available</p>
            </div>

            <div className="grid">
                <div className="date-labels">
                    <div className="date-label"></div>
                    {dates.map((date, i) => (
                        <div className="date-label" key={i}>{date}</div>
                    ))}
                </div>
                <div className="day-labels">
                    <div className="day-label"></div>
                    {days.map((day, i) => (
                        <div className="day-label" key={i}>{day}</div>
                    ))}
                </div>
                <div className="table">
                    <div className="time-labels">
                        {hours.map((time, i) => (
                            <div className="time-label" key={i}>{getHour(time)}</div>
                        ))}
                    </div>
                    <div className="columns">
                        {columns.map((col, i) => (
                            <div className="column" key={i}>
                                {col.map((slot, j) => (
                                    <div className="cell" 
                                        key={j} 
                                        style={{background: colors[avails[i*col.length + j] ? avails[i*col.length + j].length : 0]}}
                                        onMouseOver={() => showDetails(slot)}
                                        onMouseLeave={hideDetails}/>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default View;
