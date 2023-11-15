import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ReservationRestaurant.css";
import { FaCalendarAlt } from "react-icons/fa";
import { cancel_reservation_client, get_reservation_restaurant, update_capacity } from "../../services/apiService";
import { format } from "date-fns";
import { confirmationMessage, errorMessage, successfulMessage } from "../messages/Messages";


function ReservationRestaurant() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [freeCapacity, setFreeCapacity] = useState([]);
    const [reservations, setReservations] = useState([]);
    const uid = localStorage.getItem('userId');
    const [selectedCapacity, setSelectedCapacity] = useState(0);
    const [selectedIndexCapacity, setSelectedIndexCapacity] = useState(0);


    const isWithin30Days = (date) => {
        const currentDate = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(currentDate.getDate() - 30);
        const thirtyDaysAhead = new Date();
        thirtyDaysAhead.setDate(currentDate.getDate() + 30);
        return date >= thirtyDaysAgo && date <= thirtyDaysAhead;
    };



    const handleDateChange = async (date) => {
        if (isWithin30Days(date)) {
            setSelectedDate(date);

            const formattedDate = format(date, "yyyy-MM-dd");

            try {
                const response = await get_reservation_restaurant(uid, formattedDate);
                const reservationsData = response.data;
                const freeCapacityArray = reservationsData.map(reservation => reservation.capacity);
                const freeCapacityData = freeCapacityArray.length > 0 ? freeCapacityArray[0] : {};
                if (freeCapacityArray.length > 0) {
                    setSelectedCapacity(freeCapacityData[0].capacity);
                }

                setFreeCapacity(freeCapacityData);

                const reservationsOnly = reservationsData.filter(reservation => reservation.hasOwnProperty('name'));
                setReservations(reservationsOnly);
            } catch (error) {
                errorMessage('Error al obtener las reservas');
                setReservations([]);
            }
        }
    };


    const handleHourChange = (event) => {
        const selectedIndex = event.target.value;
        setSelectedCapacity(freeCapacity[selectedIndex].capacity);
        setSelectedIndexCapacity(selectedIndex);
    };


    const handleUpdateCapacity = async () => {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
        try {
            const hours = freeCapacity.map(capacity => capacity.hour);
            const capacities = freeCapacity.map(capacity => capacity.capacity);
    
            await update_capacity(uid, formattedDate, hours, capacities);
            successfulMessage('Se ha modificado con éxito la capacidad para esa franja horaria')
    
        } catch (error) {
            errorMessage('No se ha podido actualizar la capacidad')
        }
    };



    useEffect(() => {
        const currentDate = new Date();
        const formattedDate = format(currentDate, "yyyy-MM-dd");

        const fetchReservations = async () => {
            try {
                const response = await get_reservation_restaurant(uid, formattedDate);
                const reservationsData = response.data;
                const freeCapacityArray = reservationsData.map(reservation => reservation.capacity);
                const freeCapacityData = freeCapacityArray.length > 0 ? freeCapacityArray[0] : {};
                console.log(freeCapacityData)
                if (freeCapacityArray.length > 0) {
                    setSelectedCapacity(freeCapacityData[0].capacity);
                }
                setFreeCapacity(freeCapacityData);

                const reservationsOnly = reservationsData.filter(reservation => reservation.hasOwnProperty('name'));
                setReservations(reservationsOnly);
            } catch (error) {
                errorMessage('Error al obtener las reservas')
                console.log(error)
                setReservations([]);
            }
        };

        fetchReservations();
    }, []);

    const handleCapacityChange = (event) => {
        freeCapacity[selectedIndexCapacity].capacity = event.target.value;
        setSelectedCapacity(event.target.value)
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
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-1">
                    <h1 className="reservation-title col-12 col-md-auto me-3">Reservas</h1>
                    <div className="form-group input-group col-12 col-md-auto mb-2">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <FaCalendarAlt className="home-icon-filter" />
                            </span>
                        </div>
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            minDate={new Date().setDate(new Date().getDate() - 30)}
                            maxDate={new Date().setDate(new Date().getDate() + 30)}
                            dateFormat="yyyy-MM-dd"
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="text-reservation-restaurant">
                    (Escoge fecha deseada para mostrar las reservas)
                </div>
            </div>
            {freeCapacity.length > 0 && (
                <div className="row mt-4 mb-4">
                    <div className="col-12 col-sm-12 col-md-3">
                        <div className="form-group">
                            <label htmlFor="hour-select">Hora:</label>
                            <select id="hour-select" className="form-control" onChange={handleHourChange}>
                                {freeCapacity.map((slot, index) => {
                                    let hour = new Date(`1970-01-01T${slot.hour}:00`);
                                    let nextHour = new Date(hour.getTime() + 60 * 60 * 1000);
                                    let formattedHour = hour.toISOString().substr(11, 5);
                                    let formattedNextHour = nextHour.toISOString().substr(11, 5);

                                    return (
                                        <option key={index} value={index}>
                                            {formattedHour} - {formattedNextHour}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                    </div>
                    <div className="col-12 col-sm-12 col-md-3">
                        <div className="form-group">
                            <label htmlFor="capacity-input">Capacidad:</label>
                            <input
                                id="capacity-input"
                                type="number"
                                className="form-control"
                                value={selectedCapacity}
                                onChange={handleCapacityChange}
                            />
                        </div>
                    </div>
                    <button type="button" className="btn btn-update-capacity col-12 col-sm-12 col-md-5" onClick={handleUpdateCapacity}>
                        Modificar capacidad
                    </button>
                </div>

            )}
            <div className="row">
                {reservations.length === 0 ? (
                    <div className="mt-3 col-12">
                        <div className="alert alert-warning" role="alert">
                            No hay reservas para la fecha seleccionada.
                        </div>
                    </div>
                ) : (
                    reservations.map((reservation, index) => (
                        <div className="mt-3 col-12" key={index}>
                            <div className="card">
                                <div className="restaurant-title-reservation card-header">
                                    <h5 className="">
                                        Reserva de {reservation.name}
                                    </h5>
                                    <small className="d-flex justify-content-end">Reserva hecha el {reservation.reservationMade}</small>
                                </div>
                                <div className="card-body">
                                    <p className="card-text">
                                        <strong>Email:</strong> {reservation.email}
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
                                                handleCancelReservation(reservation.clientID, reservation.restaurantID, reservation.date, reservation.numGuests, reservation.hour, reservation.reservationMade)
                                            }
                                        >
                                            Cancelar reserva
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ReservationRestaurant;
