import React, { useState } from 'react';
import './Header.scss';
import { Link } from "react-router-dom";

function Header() {
    const [selected, setSelected] = useState('c');
    
    return (
        <div className="header">
            <ul>
                <li className={selected === 'c' ? 'selected': ''} onClick={() => setSelected('c')}>
                    <Link to="/"><p>create new event</p></Link>
                </li>
                <li className={selected === 'f' ? 'selected': ''} onClick={() => setSelected('f')}>
                    <Link to="/find"><p>find event</p></Link>
                </li>
                <li className="slider"></li>
            </ul>
        </div>
    );
}

export default Header;
