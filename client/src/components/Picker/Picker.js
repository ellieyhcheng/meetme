import React, { useState, useEffect } from 'react';
import './Picker.scss';
import moment from 'moment-timezone';
import { withAPI } from '../API';

function Picker({availability={}, user, getAvailability=() => {}, timezone}) {
    const uid = user.uid;
    
    const times = availability ? Object.keys(availability) : [];
    const avails = times.reduce((prev, time) => {
        var availables = availability[time];
        if (availables.includes(uid)) {
            prev.push(time);
            return prev;
        }
        else return prev
    }, [])

    var columns = [];
    var days = [];
    var dates = [];
    var hours = [];

    const [actives, setActives] = useState({perm: avails, temp: avails});
    const [drag, setDrag] = useState(0); // 0 = false, 1 = add, 2 = remove
    const [start, setStart] = useState({r: 0, c: 0, x: 0, y: 0, width: 0, height: 0});

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

    useEffect(() => {
        getAvailability(actives.perm)
    }, [actives.perm, getAvailability])

    const getHour = (time) => {
        let hour = moment.unix(time).tz(timezone).format('h a')
        if (hour === '12 am') return 'midnight';
        if (hour === '12 pm') return 'noon';
        return hour;
    }

    const startActive = (e) => {
        if (drag === 0 && e.target.classList.contains("cell")) {
            let temp = [...actives.perm];
            let idx = temp.indexOf(e.target.dataset.time);

            if (e.target.classList.contains("active")) {
                setDrag(2); // erase mode
                if (idx >= 0) {
                    temp.splice(idx, 1);
                }
            }
            else {
                setDrag(1); // mark mode
                if (idx < 0) {
                    temp.push(e.target.dataset.time);
                }
            }
            const split = e.target.id.split('-');
            const r = parseInt(split[1]);
            const c = parseInt(split[2]);
            
            setStart({r, c, x:0, y:0, width: 0, height: 0});
            setActives(actives => ({perm: actives.perm, temp: temp}))
            
        } else {
            setActives(actives => ({perm: actives.perm, temp: [...actives.perm]}))
        }
        document.addEventListener('mouseup', finishActive)
    }

    const markActive = (e) => {
        if (drag > 0 && e.target.classList.contains("cell")) {
            let temp = [...actives.temp];
            const split = e.target.id.split('-');
            const row = parseInt(split[1]);
            const col = parseInt(split[2]);

            let top = start.r < row ? start.r : row;
            let bottom = start.r >= row ? start.r : row;
            let left = start.c < col ? start.c : col;
            let right = start.c >= col ? start.c : col;

            const rowsLength = columns[0].length

            if (drag === 1) {
                for (let c = 0; c < columns.length; c++) {
                    for (let r = 0; r < rowsLength; r++) {
                        let time = document.getElementById(`yourCell-${r}-${c}`).dataset.time
                        let idx = temp.indexOf(time);

                        if (r >= top && r <= bottom && c <= right && c >= left) {
                            if (idx < 0) {
                                temp.push(time);
                            }
                        } else {
                            let i = actives.perm.indexOf(time);
                            if (i >= 0) {
                                if (idx < 0) {
                                    temp.push(time);
                                }
                            }
                            else {
                                if (idx >= 0) {
                                    temp.splice(idx, 1);
                                }
                            }
                            
                        }
                    }
                }
            }
            else {
                for (let c = 0; c < columns.length; c++) {
                    for (let r = 0; r < rowsLength; r++) {
                        let time = document.getElementById(`yourCell-${r}-${c}`).dataset.time
                        let idx = temp.indexOf(time);

                        if (r >= top && r <= bottom && c <= right && c >= left) {       
                            if (idx >= 0) {
                                temp.splice(idx, 1);
                            }
                        }
                        else {
                            let i = actives.perm.indexOf(time);
                            if (i >= 0) {
                                if (idx < 0) {
                                    temp.push(time);
                                }
                            }
                            else {
                                if (idx >= 0) {
                                    temp.splice(idx, 1);
                                }
                            }
                        }
                    }
                }
            }

            setActives(actives => ({perm: actives.perm, temp:temp}))
        }
    }

    const finishActive = () => {
        setDrag(0);

        setActives(newActives => ({perm: newActives.temp, temp: newActives.temp}));
        document.removeEventListener('mouseup', finishActive)
    }

    const touchStartActive = (e) => {
        if (e.target.classList.contains("cell")) {

            let temp = [...actives.perm];
            let idx = temp.indexOf(e.target.dataset.time);

            if (e.target.classList.contains("active")) {
                setDrag(2); // erase mode
                if (idx >= 0) {
                    temp.splice(idx, 1);
                }
            }
            else {
                setDrag(1); // mark mode
                if (idx < 0) {
                    temp.push(e.target.dataset.time);
                }
            }
            const split = e.target.id.split('-');
            const r = parseInt(split[1]);
            const c = parseInt(split[2]);

            let style = e.target.currentStyle || window.getComputedStyle(e.target);
            let width = parseInt(style.width) + parseInt(style.borderRightWidth) + parseInt(style.paddingRight) + parseInt(style.marginRight);
            let height = parseInt(style.height) + parseInt(style.borderTopWidth) + parseInt(style.paddingTop) + parseInt(style.marginTop);
            
            setStart({r, c, x: e.targetTouches[0].pageX, y: e.targetTouches[0].pageY, width, height});
            setActives(actives => ({perm: actives.perm, temp: temp}))
        } else {
            setActives(actives => ({perm: actives.perm, temp: [...actives.perm]}))
        }
        document.addEventListener('touchend', touchFinishActive)
    }

    const touchMarkActive = (e) => {
        if (drag === 0) return;

        let xPos = e.targetTouches[0].pageX;
        let yPos = e.targetTouches[0].pageY;

        let row = start.r + Math.floor((yPos - start.y) / start.height);
        let col = start.c + Math.floor((xPos - start.x + (start.x % start.width)) / start.width);

        // right to left or bottom to top
        if (yPos - start.y < 0)
            row = start.r + Math.ceil((yPos - start.y) / start.height);
        if (xPos - start.x < 0)
            col = start.c - Math.floor((start.x - xPos + (Math.abs(start.width - start.x) % start.width)) / start.width);

        const rowsLength = columns[0].length

        row = row < 0 ? 0 : row;
        row = row > rowsLength ? rowsLength : row;

        col = col < 0 ? 0 : col;
        col = col > columns.length ? columns.length : col;
        
        let temp = [...actives.temp];

        let top = start.r < row ? start.r : row;
        let bottom = start.r >= row ? start.r : row;
        let left = start.c < col ? start.c : col;
        let right = start.c >= col ? start.c : col;

        if (drag === 1) {
            for (let c = 0; c < columns.length; c++) {
                for (let r = 0; r < rowsLength; r++) {
                    let time = document.getElementById(`yourCell-${r}-${c}`).dataset.time
                    let idx = temp.indexOf(time);

                    if (r >= top && r <= bottom && c <= right && c >= left) {
                        if (idx < 0) {
                            temp.push(time);
                        }
                    } else {
                        let i = actives.perm.indexOf(time);
                        if (i >= 0) {
                            if (idx < 0) {
                                temp.push(time);
                            }
                        }
                        else {
                            if (idx >= 0) {
                                temp.splice(idx, 1);
                            }
                        }
                        
                    }
                }
            }
        }
        else {
            for (let c = 0; c < columns.length; c++) {
                for (let r = 0; r < rowsLength; r++) {
                    let time = document.getElementById(`yourCell-${r}-${c}`).dataset.time
                    let idx = temp.indexOf(time);

                    if (r >= top && r <= bottom && c <= right && c >= left) {       
                        if (idx >= 0) {
                            temp.splice(idx, 1);
                        }
                    }
                    else {
                        let i = actives.perm.indexOf(time);
                        if (i >= 0) {
                            if (idx < 0) {
                                temp.push(time);
                            }
                        }
                        else {
                            if (idx >= 0) {
                                temp.splice(idx, 1);
                            }
                        }
                    }
                }
            }
        }
        setActives(actives => ({perm: actives.perm, temp:temp}))
    }

    const touchFinishActive = (e) => {
        setDrag(0);

        setActives(newActives => ({perm: newActives.temp, temp: newActives.temp}));
        document.removeEventListener('touchend', touchFinishActive)
        e.preventDefault()
    }

    return (
        <div className="picker noselect">
            <p className="heading">{user.username}'s availability</p>

            <div className="legend">
                <div className="available">
                    <div className="box"></div>
                    Available
                </div>
                <div className="unavailable">
                    <div className="box"></div>
                    Unavailable
                </div>
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
                    <div className="columns"
                        onMouseDown={startActive}
                        onMouseOver={markActive}
                        onTouchStart={touchStartActive}
                        onTouchMove={touchMarkActive}
                        >
                        {columns.map((col, i) => (
                            <div className="column" key={i}>
                                {col.map((slot, j) => (
                                    <div className={actives.temp.includes(slot) ? 'cell active' : 'cell'} 
                                        id={`yourCell-${j}-${i}`} 
                                        data-time={slot} 
                                        key={j}/>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAPI(Picker);
