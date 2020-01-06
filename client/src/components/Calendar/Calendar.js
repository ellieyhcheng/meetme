import React, { useState, useEffect } from 'react';
import './Calendar.scss';
import moment from 'moment-timezone';
import Date from '../Date/Date';
import arrow from '../../assets/triangle.svg';
import solidArrow from '../../assets/triangle-filled.svg';
import Button from '../Button/Button';

const daysOfTheWeek = ['S', 'M', 'T', 'W', 'R', 'F', 'S'];

function Calendar({type = 'date', getDates=() => {}}) {
    const [m, setM] = useState(moment());
    const [update, setUpdate] = useState(true);
    const [rows, setRows] = useState([]);
    const [monthLabels, setMonthLabels] = useState([]);
    const [yearLabels, setYearLabels] = useState([]);
    const [actives, setActives] = useState({perm: [], temp: []});
    const [drag, setDrag] = useState(0); // 0 = false, 1 = add, 2 = remove
    const [start, setStart] = useState({r: 0, c: 0, x: 0, y: 0, width: 0});

    useEffect(() => {
        if (type === "week") {
            setRows([daysOfTheWeek.map((day, i) => `0-${i}-${day}`)])
        }
        else {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            let firstDay = moment(m).startOf("month").format('d');

            let cells = [];
            let monthLabels = [];
            let yearLabels = [];
            let spillover = false;

            for (let i = firstDay - 1; i >= 0; i--) {
                cells.push(
                    moment(m).subtract(1, 'months').endOf('month').subtract(i, 'days').format('YYYY-MM-D')
                )
            }

            if (cells.length > 0) {
                spillover = true;
            }

            for (let d = 0; d < m.daysInMonth(); d++) {
                cells.push(
                    moment(m).startOf('month').add(d, 'days').format('YYYY-MM-D')
                );
            }

            let rows = [];
            let r = [];
            cells.forEach((c, i) => {
                if (i === 0 || i % 7 !== 0) {
                    r.push(c);
                }
                else {
                    if (spillover) {
                        monthLabels.push(months[(moment(m).subtract(1, 'months').month())] + '/' + months[m.month()]);
                        if (moment(m).year() === (moment(m).subtract(1, 'months').year())) {
                            yearLabels.push(moment(m).year())
                        }
                        else {
                            yearLabels.push((moment(m).subtract(1, 'months').year()) + '/' + moment(m).year())
                        }
                        spillover = false;
                    }
                    else {
                        monthLabels.push(months[m.month()]);
                        yearLabels.push(moment(m).year())
                    }
                    rows.push(r);
                    r = [];
                    r.push(c);
                }

                if (i === cells.length - 1) {
                    if ((i + 1) % 7 !== 0) {
                        monthLabels.push(months[m.month()] + '/' + months[moment(m).add(1, 'months').month()])
                        if (moment(m).year() === (moment(m).add(1, 'months').year())) {
                            yearLabels.push(moment(m).year())
                        }
                        else {
                            yearLabels.push(moment(m).year() + '/' + (moment(m).add(1, 'months').year()))
                        }
                    }
                    else {
                        monthLabels.push(months[m.month()]);
                        yearLabels.push(moment(m).year())
                    }
                    for (let j = i % 7; j < 6; j++) {
                        r.push(
                            moment(m).add(1, 'months').startOf('month').add(j - (i % 7), 'days').format('YYYY-MM-D')
                        )
                    }

                    rows.push(r);
                }
            });

            setRows(rows);
            setMonthLabels(monthLabels);
            setYearLabels(yearLabels);
            setUpdate(false);
        }
    }, [m, update, type])

    useEffect(() => {
        getDates(actives.perm)
    }, [actives, getDates])

    useEffect(() => {
        setActives({perm: [], temp: []})
    }, [type])

    const addMonth = () => {
        setM(m => m.add(1, 'months'))
        setUpdate(true);
    }

    const subtractMonth = () => {
        setM(m => {
            const lastMonth = moment(m).subtract(1,'month')
            if (lastMonth.isBefore(moment(), 'month'))
                return m
            else
                return lastMonth
        })
        setUpdate(true);
    }

    const startActive = (e) => {
        if (drag === 0 && e.target.classList.contains("date")) {
            let temp = [...actives.perm];
            let idx = temp.indexOf(e.target.dataset.date);

            if (e.target.classList.contains("active")) {
                setDrag(2); // erase mode
                if (idx >= 0) {
                    temp.splice(idx, 1);
                }
            }
            else {
                setDrag(1); // mark mode
                if (idx < 0) {
                    temp.push(e.target.dataset.date);
                }
            }
            const split = e.target.id.split('-');
            const r = parseInt(split[1]);
            const c = parseInt(split[2]);
            
            setStart({r, c, x:0, y:0, width: 0});
            setActives(actives => ({perm: actives.perm, temp: temp}))
            
           
        } else {
            setActives(actives => ({perm: actives.perm, temp: [...actives.perm]}))
        }
        document.addEventListener('mouseup', finishActive)
    }

    const markActive = (e) => {
        if (drag > 0 && e.target.classList.contains("date")) {
            let temp = [...actives.temp];
            const split = e.target.id.split('-');
            const row = parseInt(split[1]);
            const col = parseInt(split[2]);

            let top = start.r < row ? start.r : row;
            let bottom = start.r >= row ? start.r : row;
            let left = start.c < col ? start.c : col;
            let right = start.c >= col ? start.c : col;

            if (drag === 1) {
                for (let r = 0; r < rows.length; r++) {
                    for (let c = 0; c < 7; c++) {
                        let date = document.getElementById(`${type}-${r}-${c}`).dataset.date
                        let idx = temp.indexOf(date);

                        if (r >= top && r <= bottom && c <= right && c >= left) {
                            if (idx < 0) {
                                temp.push(date);
                            }
                        } else {
                            let i = actives.perm.indexOf(date);
                            if (i >= 0) {
                                if (idx < 0) {
                                    temp.push(date);
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
                for (let r = 0; r < rows.length; r++) {
                    for (let c = 0; c < 7; c++) {
                        let date = document.getElementById(`${type}-${r}-${c}`).dataset.date
                        let idx = temp.indexOf(date);

                        if (r >= top && r <= bottom && c <= right && c >= left) {       
                            if (idx >= 0) {
                                temp.splice(idx, 1);
                            }
                        }
                        else {
                            let i = actives.perm.indexOf(date);
                            if (i >= 0) {
                                if (idx < 0) {
                                    temp.push(date);
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
        if (e.target.classList.contains("date")) {

            let temp = [...actives.perm];
            let idx = temp.indexOf(e.target.dataset.date);

            if (e.target.classList.contains("active")) {
                setDrag(2); // erase mode
                if (idx >= 0) {
                    temp.splice(idx, 1);
                }
            }
            else {
                setDrag(1); // mark mode
                if (idx < 0) {
                    temp.push(e.target.dataset.date);
                }
            }
            const split = e.target.id.split('-');
            const r = parseInt(split[1]);
            const c = parseInt(split[2]);

            let style = e.target.currentStyle || window.getComputedStyle(e.target);
            let width = parseInt(style.width) + parseInt(style.borderRightWidth) + parseInt(style.paddingRight) + parseInt(style.marginRight);
            
            setStart({r, c, x: e.targetTouches[0].pageX, y: e.targetTouches[0].pageY, width});
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

        let row = start.r + Math.floor((yPos - start.y) / start.width);
        let col = start.c + Math.floor((xPos - start.x) / start.width);

        if (yPos - start.y < 0) // right to left or bottom to top
            row = start.r + Math.ceil((yPos - start.y) / (start.width));

        if (xPos - start.x < 0)
            col = start.c + Math.ceil((xPos - start.x) / (start.width));

        row = row < 0 ? 0 : row;
        row = row > rows.length ? rows.length : row;

        col = col < 0 ? 0 : col;
        col = col > 6 ? 6 : col;
        
        let temp = [...actives.temp];

        let top = start.r < row ? start.r : row;
        let bottom = start.r >= row ? start.r : row;
        let left = start.c < col ? start.c : col;
        let right = start.c >= col ? start.c : col;

        if (drag === 1) {
            for (let r = 0; r < rows.length; r++) {
                for (let c = 0; c < 7; c++) {
                    let date = document.getElementById(`${type}-${r}-${c}`).dataset.date
                    let idx = temp.indexOf(date);

                    if (r >= top && r <= bottom && c <= right && c >= left) {
                        if (idx < 0) {
                            temp.push(date);
                        }
                    } else {
                        let i = actives.perm.indexOf(date);
                        if (i >= 0) {
                            if (idx < 0) {
                                temp.push(date);
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
            for (let r = 0; r < rows.length; r++) {
                for (let c = 0; c < 7; c++) {
                    let date = document.getElementById(`${type}-${r}-${c}`).dataset.date
                    let idx = temp.indexOf(date);

                    if (r >= top && r <= bottom && c <= right && c >= left) {       
                        if (idx >= 0) {
                            temp.splice(idx, 1);
                        }
                    }
                    else {
                        let i = actives.perm.indexOf(date);
                        if (i >= 0) {
                            if (idx < 0) {
                                temp.push(date);
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
        <div className="calendar noselect" >
            {type !== 'week' &&
                <div className="days-of-the-week">
                    <div className="label left">
                        <button onClick={subtractMonth}>
                            <img src={arrow} alt="v"
                            onMouseOver={(e) => e.currentTarget.src=solidArrow} 
                            onMouseLeave={(e) => e.currentTarget.src=arrow}
                            onTouchStart={(e) => {e.currentTarget.src=solidArrow; subtractMonth();}}
                            onTouchEnd={(e) => {e.currentTarget.src=arrow; e.preventDefault()}}/>
                        </button>
                    </div>
                    {daysOfTheWeek.map((day, i) => (
                        <div className="day" key={i}>
                            {day}
                        </div>
                    ))}
                    <div className="label right">
                        <button onClick={addMonth}>
                            <img src={arrow} alt="v"  
                            onMouseOver={(e) => e.currentTarget.src=solidArrow} 
                            onMouseLeave={(e) => e.currentTarget.src=arrow} 
                            onTouchStart={(e) => {e.currentTarget.src=solidArrow; addMonth();}}
                            onTouchEnd={(e) => {e.currentTarget.src=arrow; e.preventDefault()}}/>
                        </button>
                    </div>
                </div>
            }

            <div className='grid' 
                onMouseDown={startActive} 
                onMouseOver={markActive}
                onTouchStart={touchStartActive}
                onTouchMove={touchMarkActive}>
                {rows.map((row, i) => (
                    <div className="grid-row" key={i}>
                        {type !== 'week' && 
                            <div className="label left">
                                {monthLabels[i]}
                            </div>
                        }
                        {row.map((date, j) => (
                            <Date date={date} id={`${type}-${i}-${j}`} key={i*7 + j} 
                                active={actives.temp.includes(date)} 
                                today={date === moment().format('YYYY-MM-D')}/>
                        ))}
                        {type !== 'week' &&
                            <div className="label right">
                                {yearLabels[i]}
                            </div>
                        }
                    </div>
                ))}
            </div>

            {type !== 'week' &&
                <div className="today-button">
                    <Button onClick={() => {setM(moment()); setUpdate(true);}}>
                        Today
                    </Button>
                </div>
            }
            
        </div>
    );
}

export default Calendar;
