import React from 'react';
import './Date.scss';

function Date({date, active, onClick, today, id}) {
    return (
        <div className={active ? "noselect date active": (today ? "noselect date today" : "noselect date")} 
            onClick={() => onClick(date)}
            id={id}>
            {date.split('-')[2]}
        </div>
    );
}

export default Date;
