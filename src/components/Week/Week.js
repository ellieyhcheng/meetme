import React, { useState } from 'react';
import './Week.scss';

function Week({week}) {
    const [active, setActive] = useState(false);

    return (
        <div className={active ? "noselect week active": "noselect week"} onClick={() => setActive(!active)}>
            <p>{week}</p>
        </div>
    );
}

export default Week;
