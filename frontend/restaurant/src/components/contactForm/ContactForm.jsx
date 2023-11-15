import React, { useState } from "react";
import "./ContactForm.css";
import { EmailConstraint } from "../../validator/emailConstraint";
import { MinCharactersConstraint } from "../../validator/minCharactersConstraint";
import { MaxCharactersConstraint } from "../../validator/maxCharactersConstraint";
import { sendContact } from "../../services/apiService";
import { errorMessage, successfulMessage } from "../messages/Messages";

function ContactForm() {
    const [formData, setFormData] = useState({
        subject: "",
        message: "",
        origin: "",
    });

    const [errorMessages, setErrorMessages] = useState({
        origin: "",
        subject: "",
        message: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEmpty = Object.values(formData).some((value) => value.trim() === "");

        if (isEmpty) {
            setErrorMessages({
                ...errorMessages,
                origin: formData.origin.trim() === "" ? "El correo electrónico no puede estar vacío" : "",
                subject: formData.subject.trim() === "" ? "El asunto no puede estar vacío" : "",
                message: formData.message.trim() === "" ? "El mensaje no puede estar vacío" : "",
            });

            return;
        }

        try {
            await sendContact(formData);
            successfulMessage("Formulario enviado correctamente");
        } catch (error) {
            errorMessage("Error al enviar el formulario");
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case "origin":
                const emailConstraint = new EmailConstraint(name, value.trim());
                setErrorMessages({
                    ...errorMessages,
                    [name]: emailConstraint.test(),
                });
                break;

            case "subject":
                const minCharsConstraintSubject = new MinCharactersConstraint(
                    "El asunto",
                    value.trim(),
                    5
                );
                const maxCharsConstraintSubject = new MaxCharactersConstraint(
                    "El mensaje",
                    value.trim(),
                    30
                );

                setErrorMessages({
                    ...errorMessages,
                    [name]: `${minCharsConstraintSubject.test()} ${maxCharsConstraintSubject.test()}`,
                });
                break;

            case "message":
                const minCharsConstraintMessage = new MinCharactersConstraint(
                    "El mensaje",
                    value.trim(),
                    20
                );
                const maxCharsConstraintMessage = new MaxCharactersConstraint(
                    "El mensaje",
                    value.trim(),
                    500
                );

                setErrorMessages({
                    ...errorMessages,
                    [name]: `${minCharsConstraintMessage.test()} ${maxCharsConstraintMessage.test()}`,
                });
                break;

            default:
                break;
        }
        setFormData({
            ...formData,
            [name]: value,
        });
    };


    return (
        <div className='container d-flex align-items-center justify-content-center' style={{ minHeight: '100vh' }}>
            <div className="card col-12 col-md-8 col-lg-7 contact-card">
                <h2 className="restaurant-title card-header">Contacto</h2>
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="col-12">
                        <div className="form-group">
                            <label htmlFor="origin">Correo eléctronico*</label>
                            <input
                                id="origin"
                                type="email"
                                className="form-control"
                                name="origin"
                                value={formData.origin}
                                onChange={handleInputChange}
                            />
                            <div className="errorMessage">{errorMessages.origin}</div>
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="subject">Asunto*</label>
                            <input
                                id="subject"
                                type="text"
                                className="form-control"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                            />
                            <div className="errorMessage">{errorMessages.subject}</div>
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="message">Mensaje*</label>
                            <textarea
                                id="message"
                                type="text"
                                rows="10"
                                className="form-control"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                            />
                            <div className="errorMessage">{errorMessages.message}</div>
                        </div>
                        <input type="hidden" name="destination" value="info.gastronet@gmail.com" />
                        <div className="form-group text-center">
                            <button
                                type="submit"
                                className="btn-restaurantRegister btn btn-primary"
                            >
                                Enviar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactForm;


