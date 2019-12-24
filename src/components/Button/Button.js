import React from 'react';
import './Button.scss';

function Button({children, onClick=()=>{}}) {
    return (
        <button className="button" 
            onClick={onClick}
            onMouseOver={(e) => e.currentTarget.classList.add('active')} 
            onMouseLeave={(e) => e.currentTarget.classList.remove('active')}
            onTouchStart={(e) => {e.currentTarget.classList.add('active'); onClick(e)}}
            onTouchEnd={(e) => {e.currentTarget.classList.remove('active'); e.preventDefault()}}>
            {children}
        </button>
    );
}

export default Button;
