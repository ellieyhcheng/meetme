import React from 'react';
import './View.scss';
import moment from 'moment';
import { colorGradient } from "../../utils";

function View({event}) {

    const {times, availability, activeUsers} = event;
    var columns = [];
    var days = [];
    var dates = [];
    var colors = colorGradient('#FFDBDB', '#000000', activeUsers.length + 1)

    if (times.length !== 0) {
        let col = [];

        for (let i = 0; i < times.length - 1; i++) {
            col.push(times[i])
            if (times[i + 1] - times[i] !== 900) {
                let m = moment.unix(times[i])
                if (m.year() !== 1971) {
                    dates.push(m.format('MMM D'))
                }
                days.push(m.format('dd')[0])
                columns.push(col);
                col = [];
            }
        }
        let m = moment.unix(times[times.length - 1])
        if (m.year() !== 1971) {
            dates.push(m.format('MMM D'))
        }
        days.push(m.format('dd')[0])
        col.push(times[times.length - 1])
        columns.push(col);

    }

    const getHour = (time) => {
        let hour = moment.unix(time).format('h a')
        if (hour === '12 am') return 'midnight';
        if (hour === '12 pm') return 'noon';
        return hour;
    }

    return (
        <div className="view noselect">
            <p className="heading">everyone's availability</p>

            <div className="legend">
                <p>0/{activeUsers.length} available</p>
                    
                <div className="gradient">
                    {[...activeUsers, 'empty'].map((user, i) => (
                        <div className="box" key={i} style={{background: colors[i]}}></div>
                    ))}
                </div>
                <p>{activeUsers.length}/{activeUsers.length} available</p>
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
                        {times.slice(0, times.length / columns.length).map((time, i) => (
                            <div className="time-label" key={i}>{getHour(time)}</div>
                        ))}
                    </div>
                    <div className="columns">
                        {columns.map((col, i) => (
                            <div className="column" key={i}>
                                {col.map((slot, j) => (
                                    <div className="cell" key={j} style={{background: colors[availability[j].length]}}>
                                    </div>
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
