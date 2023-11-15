import React from "react";

const UserNavbar = () => {

    return (
        <ul className="navbar-nav">
            <li class="nav-item active">
                <a class="nav-link" href="/home">Inicio</a>
            </li>
            <li class="nav-item active">
                <a class="nav-link" href="/register">Registrarse</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/contact">Contacto</a>
            </li>
            <li class="nav-item active">
                <a className="nav-link aNavbar" href="/login">Iniciar sesión</a>
            </li>
        </ul>
    );
};

export default UserNavbar;