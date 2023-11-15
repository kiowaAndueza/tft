import React, { useState } from "react";
import "./ReservationForm.css";
import { FaCalendarAlt, FaClock, FaUsers } from "react-icons/fa";
import { DateTimeConstraint } from "../../validator/dateTimeConstraint";
import { addReservation } from "../../services/apiService";
import { errorMessage, successfulMessage } from "../messages/Messages";
import { useEffect } from "react";

function ReservationForm() {
    const uid = localStorage.getItem("userId");
    const idRestaurant = localStorage.getItem("idRestaurant");
    const userType = localStorage.getItem("userType")


    const [formData, setFormData] = useState({
        restaurantId: idRestaurant,
        date: "",
        hour: "",
        numGuests: "",
    });

    useEffect(() => {
        const storedFormData = JSON.parse(localStorage.getItem("formData"));
        if (storedFormData) {
            setFormData((prevData) => ({
                ...prevData,
                date: storedFormData.date,
                hour: storedFormData.time,
                numGuests: storedFormData.numGuests,
            }));
        }
    }, []);


    const [errorMessages, setErrorMessages] = useState({
        restaurantId: "",
        date: "",
        hour: "",
        numGuests: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        setErrorMessages({ ...errorMessages, [name]: "" });
    };

    const validateDateTime = () => {
        const { date, hour } = formData;
        if (date && hour) {
            const dateTimeValue = `${date}T${hour}:00`;
            const dateTimeConstraint = new DateTimeConstraint("", dateTimeValue);

            if (!dateTimeConstraint.validate()) {
                throw new Error(dateTimeConstraint.getMessage());
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (userType !== "client") {
            errorMessage("Solo los clientes registrados pueden realizar reservas.");
            return;
        }

        const fieldsToValidate = {
            date: "Selecciona una fecha",
            hour: "Selecciona una hora",
            numGuests: "Ingresa el nº de comensales",
        };

        const newErrorMessages = {};

        for (const fieldName in fieldsToValidate) {
            if (!formData[fieldName]) {
                newErrorMessages[fieldName] = fieldsToValidate[fieldName];
            }
        }

        const numGuests = parseInt(formData.numGuests);
        if (isNaN(numGuests) || numGuests < 1) {
            newErrorMessages.numGuests = "El nº  de comensales debe ser mínimo 1";
        }

        try {
            validateDateTime();
        } catch (error) {
            newErrorMessages.date = error.message;
        }

        setErrorMessages(newErrorMessages);

        if (Object.values(newErrorMessages).some((message) => message !== "")) {
            return;
        }

        try {
            const response = await addReservation(uid, formData);
            if (response.data.success) {
                successfulMessage("La reserva se ha realizado correctamente");
            } else {
                errorMessage(response.data.message);
            }
        } catch (error) {
            console.log(error)
            errorMessage(error.response.data.message);
        }
    };

    return (
        <div className="container mt-1">
            <form className="reservation-form form-group">
                <h3 className="search-title-filter">Reservar</h3>
                <input
                    type="hidden"
                    id="restaurantId"
                    name="restaurantId"
                    value={formData.restaurantId}
                    onChange={handleInputChange}
                />
                <div className="form-group">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <FaCalendarAlt className="home-icon-filter" />
                            </span>
                        </div>
                        <input
                            type="date"
                            className="form-control"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="mb-3">
                    {errorMessages.date && (
                        <div className="text-danger">{errorMessages.date}</div>
                    )}
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <FaClock className="home-icon-filter" />
                            </span>
                        </div>
                        <input
                            type="time"
                            className="form-control"
                            id="hour"
                            name="hour"
                            value={formData.hour}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="mb-3">
                    {errorMessages.hour && (
                        <div className="text-danger">{errorMessages.hour}</div>
                    )}
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <FaUsers className="home-icon-filter" />
                            </span>
                        </div>
                        <input
                            type="number"
                            className="form-control"
                            id="numGuests"
                            name="numGuests"
                            step="1"
                            min="1"
                            value={formData.numGuests}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="mb-3">
                    {errorMessages.numGuests && (
                        <div className="text-danger">{errorMessages.numGuests}</div>
                    )}
                </div>

                <button
                    type="button"
                    className="btn mt-3 btn-primary btn-block btn-reservation-form"
                    onClick={handleSubmit}
                >
                    Reservar
                </button>
            </form>
        </div>
    );
}

export default ReservationForm;
