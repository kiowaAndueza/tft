import { cancel_reservation_client, get_reservation_client } from "../../services/apiService";
import { confirmationMessage, errorMessage, successfulMessage } from "../messages/Messages";
import "./ReservationClient.css";
import React, { useEffect, useState } from "react";


function ReservationClient() {
    const [pastReservations, setPastReservations] = useState([]);
    const [presentReservations, setPresentReservations] = useState([]);
    const [cancelReservations, setCancelReservations] = useState([]);
    const [viewType, setViewType] = useState("present");
    const uid = localStorage.getItem('userId');
    const [reservationsData, setReservationsData] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await get_reservation_client(uid);
                const data = response.data;
                setReservationsData(data);

                if (data.past) {
                    setPastReservations(data.past);
                }

                if (data.present) {
                    setPresentReservations(data.present);
                }

                if (data.cancel) {
                    setCancelReservations(data.cancel);
                }
            } catch (error) {
                errorMessage('Error al obtener las reservas');
                setPastReservations([]);
                setPresentReservations([]);
                setReservationsData(null);
            }
        };

        fetchReservations();
        window.addEventListener('load', fetchReservations);

        return () => {
            window.removeEventListener('load', fetchReservations);
        };
    }, [uid]);

    const handleViewTypeChange = (event) => {
        setViewType(event.target.value);
    };

    const handleReservationClick = (restaurantID) => {
        localStorage.setItem("idRestaurant", restaurantID);
    };

    const handleCancelReservation = async (uid, restaurantID, date, numGuests, hour, reservationMade) => {
        confirmationMessage('¿Estás seguro de que quieres cancelar la reserva?')
            .then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await cancel_reservation_client(uid, restaurantID, date, numGuests, hour, reservationMade);
                        if (response.data) {
                            successfulMessage('Se ha cancelado correctamente la reserva');
                            window.location.reload();
                        } else {
                            errorMessage('Error. No se ha podido cancelar la reserva');
                        }
                    } catch (error) {
                        errorMessage('Error. No se ha podido cancelar la reserva');
                    }
                }
            });
    };

    return (
        <div>
            <div className="box-title-reservation-restaurant">
                <h1 className="reservation-title">Mis Reservas</h1>
                <div className="form-group">
                    <select
                        id="viewTypeSelect"
                        className="form-control"
                        value={viewType}
                        onChange={handleViewTypeChange}
                    >
                        <option value="present">Reservas Actuales</option>
                        <option value="past">Reservas Pasadas</option>
                        <option value="cancel">Reservas Canceladas</option>
                    </select>
                </div>
                <div className="text-reservation-restaurant mt-1">
                    (Selecciona el tipo de reserva que deseas mostrar)
                </div>
            </div>

            <div className="row">
                {reservationsData === null && (
                    <div className="mt-3 col-12">
                        <div className="alert alert-warning" role="alert">
                            Aún no se han realizado reservas.
                        </div>
                    </div>
                )}

                {viewType === "present" && (
                    presentReservations.length > 0 ? (
                        <div className="mt-3 col-12">
                            {presentReservations.map((reservation, index) => (
                                <div className="card mb-3" key={index}>
                                    <div className="restaurant-title-reservation card-header">
                                        <h5>
                                            <a
                                                className="custom-link"
                                                href={`/restaurant/${reservation.restaurantID}`}
                                                onClick={() => handleReservationClick(reservation.restaurantID)}
                                            >
                                                Reserva en {reservation.name}
                                            </a>
                                        </h5>
                                        <small className="d-flex justify-content-end">
                                            Reserva hecha el {reservation.reservationMade}
                                        </small>
                                    </div>
                                    <div className="card-body">
                                        <p className="card-text">
                                            <strong>Fecha:</strong> {reservation.date}
                                        </p>
                                        <p className="card-text">
                                            <strong>Hora:</strong> {reservation.hour}
                                        </p>
                                        <p className="card-text">
                                            <strong>Nº Comensales:</strong> {reservation.numGuests}
                                        </p>
                                        <div className="d-flex justify-content-end">
                                            <button
                                                className="btn btn-cancel-reservation"
                                                onClick={() =>
                                                    handleCancelReservation(uid, reservation.restaurantID, reservation.date, reservation.numGuests, reservation.hour, reservation.reservationMade)
                                                }
                                            >
                                                Cancelar reserva
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-3 col-12">
                            {reservationsData != null && (
                                <div className="alert alert-warning" role="alert">
                                    No hay reservas activas.
                                </div>
                            )}
                        </div>
                    )
                )}
                {viewType === "past" && (
                    pastReservations.length > 0 ? (
                        pastReservations.map((reservation, index) => (
                            <div className="mt-3 mb-3 col-12" key={index}>
                                <div className="card">
                                    <h5 className="restaurant-title-reservation card-header">
                                        <a
                                            className="custom-link"
                                            href={`/restaurant/${reservation.restaurantID}`}
                                            onClick={() => handleReservationClick(reservation.restaurantID)}
                                        >
                                            Reserva en {reservation.name}
                                        </a>
                                    </h5>
                                    <div className="card-body">
                                        <p className="card-text">
                                            <strong>Fecha:</strong> {reservation.date}
                                        </p>
                                        <p className="card-text">
                                            <strong>Hora:</strong> {reservation.hour}
                                        </p>
                                        <p className="card-text">
                                            <strong>Nº Comensales:</strong> {reservation.numGuests}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="mt-3 col-12">
                            {reservationsData != null && (
                                <div className="alert alert-warning" role="alert">
                                    No hay reservas pasadas.
                                </div>
                            )}
                        </div>
                    )
                )}

                {viewType === "cancel" && (
                    <>
                        {cancelReservations.length ? (
                            <div className="mt-3 col-12">
                                {cancelReservations.map((reservation, index) => (
                                    <div className="card mb-3" key={index}>
                                        <div className="restaurant-title-reservation card-header">
                                            <h5>
                                                <a
                                                    className="custom-link"
                                                    href={`/restaurant/${reservation.restaurantID}`}
                                                    onClick={() => handleReservationClick(reservation.restaurantID)}
                                                >
                                                    Reserva en {reservation.name}
                                                </a>
                                            </h5>
                                            <small className="d-flex justify-content-end">
                                                Reserva hecha el {reservation.reservationMade}
                                            </small>
                                        </div>
                                        <div className="card-body">
                                            <p className="card-text">
                                                <strong>Fecha:</strong> {reservation.date}
                                            </p>
                                            <p className="card-text">
                                                <strong>Hora:</strong> {reservation.hour}
                                            </p>
                                            <p className="card-text">
                                                <strong>Nº Comensales:</strong> {reservation.numGuests}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-3 col-12">
                                {reservationsData != null && (
                                    <div className="alert alert-warning" role="alert">
                                        No hay reservas canceladas.
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ReservationClient;
