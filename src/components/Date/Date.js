import React from 'react';
import './Date.scss';

function Date({date, active, today, id}) {
    return (
        <div className={active ? "date active": (today ? "date today" : "date")} 
            id={id}
            data-date={date}>
            {date.split('-')[2]}
        </div>
    );
}

export default Date;
