import React, { useState, useEffect } from 'react';
import './Calendar.scss';
import moment from 'moment';
import Date from '../Date/Date';
import arrow from '../../assets/triangle.svg';
import solidArrow from '../../assets/triangle-filled.svg';

const daysOfTheWeek = ['S', 'M', 'T', 'W', 'R', 'F', 'S'];

function Calendar() {
    const [m, setM] = useState(moment());
    const [update, setUpdate] = useState(true);
    const [rows, setRows] = useState([]);
    const [monthLabels, setMonthLabels] = useState([]);
    const [yearLabels, setYearLabels] = useState([]);
    const [actives, setActives] = useState([]);
    const [drag, setDrag] = useState(0); // 0 = false, 1 = add, 2 = remove
    const [start, setStart] = useState({r: 0, c: 0});
    const [tempActives, setTempActives] = useState([]);

    useEffect(() => {
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
                        yearLabels.push(moment(m).year() + '/' + (moment(m).subtract(1, 'months').year()))
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
    }, [m, update])

    const addMonth = () => {
        setM(m.add(1, 'months'))
        setUpdate(true);
    }

    const subtractMonth = () => {
        setM(m.subtract(1, 'months'))
        setUpdate(true);
    }

    const addActive = (date) => {
        let idx = tempActives.indexOf(date);
        let newActive = tempActives;

        if (idx < 0) {
            newActive.push(date);
            setTempActives(newActive);
        }
    }

    const removeActive = (date) => {
        let idx = tempActives.indexOf(date);
        let newActive = tempActives;

        if (idx >= 0) {
            newActive.splice(idx, 1);
            setTempActives(newActive);
        }
    }

    const startActive = (e) => {
        if (e.target.classList.contains("date")) {
            if (e.target.classList.contains("active")) {
                setDrag(2); // erase mode
                setTempActives(actives)
                removeActive(e.target.dataset.date)
            }
            else {
                setDrag(1); // mark mode
                addActive(e.target.dataset.date)
            }
            const split = e.target.id.split('-');
            const r = parseInt(split[1]);
            const c = parseInt(split[2]);
            
            setStart({r, c});
        }
    }

    const markActive = (e) => {
        if (drag > 0 && e.target.classList.contains("date")) {
            const split = e.target.id.split('-');
            const row = parseInt(split[1]);
            const col = parseInt(split[2]);

            let top = start.r < row ? start.r : row;
            let bottom = start.r >= row ? start.r : row;
            let left = start.c < col ? start.c : col;
            let right = start.c >= col ? start.c : col;

            if (drag === 1) {
                for (let r=top; r <= bottom; r++) {
                    for (let c=left; c <= right; c++) {
                        addActive(document.getElementById(`Date-${r}-${c}`).dataset.date)
                    }
                }
            }
            else {
                for (let r=top; r <= bottom; r++) {
                    for (let c=left; c <= right; c++) {
                        removeActive(document.getElementById(`Date-${r}-${c}`).dataset.date)
                    }
                }
            }

            // top section
            for (let r = 0; r < top; r++) {
                for (let c = 0; c < 7; c++) {
                    let date = document.getElementById(`Date-${r}-${c}`).dataset.date
                    if (actives.includes(date)) {
                        addActive(date)
                    }
                    else {
                        removeActive(date)
                    }
                }
            }
            
            // bottom section
            for (let r = bottom + 1; r < rows.length; r++) {
                for (let c = 0; c < 7; c++) {
                    let date = document.getElementById(`Date-${r}-${c}`).dataset.date
                    if (actives.includes(date)) {
                        addActive(date)
                    }
                    else {
                        removeActive(date)
                    }
                }
            }

            // left section
            for (let r = 0; r < rows.length; r++) {
                for (let c = 0; c < left; c++) {
                    let date = document.getElementById(`Date-${r}-${c}`).dataset.date
                    if (actives.includes(date)) {
                        addActive(date)
                    }
                    else {
                        removeActive(date)
                    }
                }
            }
            
            // right section
            for (let r = 0; r < rows.length; r++) {
                for (let c = right + 1; c < 7; c++) {
                    let date = document.getElementById(`Date-${r}-${c}`).dataset.date
                    if (actives.includes(date)) {
                        addActive(date)
                    }
                    else {
                        removeActive(date)
                    }
                }
            }
        }
        setUpdate(true)

    }

    const finishActive = (e) => {
        setDrag(false);

        let temp = [...actives, ...tempActives];
            
        setActives([...new Set(temp)]);
        setTempActives([]);
    }

    return (
        <div className="calendar noselect" >
            <div className="days-of-the-week">
                <div className="label left">
                    <img src={arrow} alt="v" onClick={subtractMonth} onMouseOver={(e) => e.currentTarget.src=solidArrow} onMouseLeave={(e) => e.currentTarget.src=arrow}/>
                </div>
                {daysOfTheWeek.map((day, i) => (
                    <div className="day" key={i}>
                        {day}
                    </div>
                ))}
                <div className="label right">
                    <img src={arrow} alt="v" onClick={addMonth} onMouseOver={(e) => e.currentTarget.src=solidArrow} onMouseLeave={(e) => e.currentTarget.src=arrow} />
                </div>
            </div>

            <div className='grid' onMouseUp={finishActive} onMouseDown={startActive} onMouseOver={markActive}>
                {rows.map((row, i) => (
                    <div className="grid-row" key={i}>
                        <div className="label left">
                            {monthLabels[i]}
                        </div>
                        {row.map((date, j) => (
                            <Date date={date} id={"Date-" + i + "-" + j} key={i*7 + j} active={actives.includes(date) || tempActives.includes(date)} today={date === moment().format('YYYY-MM-D')}/>
                        ))}
                        <div className="label right">
                            {yearLabels[i]}
                        </div>
                    </div>
                ))}
            </div>
            <div className="today-button">
                <div className="button" 
                    onClick={() => {setM(moment()); setUpdate(true);}}
                    onMouseOver={(e) => e.currentTarget.classList.add('active')} 
                    onMouseLeave={(e) => e.currentTarget.classList.remove('active')}>
                    Today
                </div>
            </div>
        </div>
    );
}

export default Calendar;
