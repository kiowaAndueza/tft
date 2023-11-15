import React from 'react';
import './Navbar.css';
import LogoIcon from '../logoIcon/LogoIcon';
import getMenuByUserType from '../navbar/NavbarController';

function Navbar() {

    const userType = localStorage.getItem('userType');

    return (
        <nav className="navbar navbar-expand-md navbar-light nav-menu">
            {LogoIcon()}
            <button id='menu' className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                {getMenuByUserType(userType)}
            </div>
        </nav>
    );
}

export default Navbar;