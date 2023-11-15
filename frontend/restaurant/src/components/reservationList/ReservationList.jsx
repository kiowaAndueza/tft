import authProvider from "../../auth/authProvider";
import ReservationClient from "../reservationClient/ReservationClient";
import ReservationRestaurant from "../reservationRestaurant/ReservationRestaurant";
import "./ReservationList.css";
import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

function ReservationList() {
    const type = localStorage.getItem("userType");
    const navigate = useNavigate();

    const redirectToPath = async (path) => {
        await navigate(path);
    };

    const checkPermission = async () => {
        const permissions = await authProvider.getPermissions();
        const hasPermission = permissions.includes("reservations");

        if (!hasPermission) {
            redirectToPath("/home");
        }
    };

    useEffect(() => {
        checkPermission();
    }, []);

    return (
        <div>
            {type === "client" ? (
                <div className="container mt-5">
                    <ReservationClient />
                </div>
            ) : (
                <div className="container mt-5">
                    <ReservationRestaurant />
                </div>
            )}
        </div>
    );
}

export default ReservationList;
