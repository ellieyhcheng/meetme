import React, { useState, useEffect } from 'react';
import './Header.scss';
import { Link, withRouter } from "react-router-dom";

function Header({location}) {
    const [selected, setSelected] = useState(location.pathname === '/find' ? 'f' : (location.pathname === '/' ? 'c' : 'e'));

    useEffect(() => {
        setSelected(location.pathname === '/find' ? 'f' : (location.pathname === '/' ? 'c' : 'e'))
    }, [location.pathname])
    
    return (
        <div className="header">
            <ul>
                <li className={selected === 'c' ? 'selected': ''} onClick={() => setSelected('c')}>
                    <Link to="/"><p>Create New Event</p></Link>
                </li>
                {/* <li className={selected === 'f' ? 'selected': ''} onClick={() => setSelected('f')}>
                    <Link to="/find"><p>find event</p></Link>
                </li> */}
                {selected !== 'e' &&
                    <li className="slider"></li>
                }
            </ul>
        </div>
    );
}

export default withRouter(Header);
