import React from "react";
import { logout } from "../../services/authService";
import { confirmationMessage } from "../messages/Messages";

const ClientNavbar = () => {
    const userId = localStorage.getItem('userId');

    const handleLogout = async () => {
        try {
            const confirmed = await confirmationMessage("¿Estás seguro de que deseas cerrar sesión?");
            if (confirmed.isConfirmed) {
                const response = await logout();
                if (response.status === 200) {
                    localStorage.setItem("userType", "");
                    localStorage.setItem("userId", "");
                    window.location.href = "/home";
                }
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <ul className="navbar-nav">
            <li class="nav-item active">
                <a class="nav-link" href="/home">Inicio</a>
            </li>
            <li className="nav-item active">
                <a className="nav-link" href="/reservations">Reservas</a>
            </li>
            <li className="nav-item active">
                <a className="nav-link" href='/myFavoriteList'>Mis Favoritos</a>
            </li>
            <li className="nav-item active">
                <a className="nav-link" href={`/my-reviews/${userId}`}>Mis Reseñas</a>
            </li>
            <li className="nav-item active">
                <a className="nav-link" href={`/client/profile/${userId}`}>Mi Perfil</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/contact">Contacto</a>
            </li>
            <li class="nav-item active">
                <button className="buttonNavbar" onClick={handleLogout}>Cerrar sesión</button>
            </li>
        </ul>
    );
};

export default ClientNavbar;