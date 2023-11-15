import defaultProfileImage from '../../assets/userDefault.jpg';
import { ImProfile } from 'react-icons/im';
import Dropzone from 'react-dropzone';
import './ClientProfile.css';
import React, { useEffect, useState } from 'react';
import { changePassword, getClient, updateClient } from '../../services/authService';
import { errorMessage, successfulMessage } from '../messages/Messages';
import { MaxCharactersConstraint } from '../../validator/maxCharactersConstraint';
import { MinCharactersConstraint } from '../../validator/minCharactersConstraint';
import { EmailConstraint } from '../../validator/emailConstraint';
import { PasswordConstraint } from '../../validator/passwordConstraint';



function ClientProfile() {
    const [profileImage, setProfileImage] = useState(defaultProfileImage);

    const [initialClientData, setInitialClientData] = useState({});
    const [acceptedFiles, setAcceptedFiles] = useState([]);

    const [clientData, setClientData] = useState({
        name: '',
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
        type: 'client'
    });

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        getClient(userId)
            .then(response => {
                const data = response.data;
                setClientData(data);
                setInitialClientData(data);
                if (data.imageProfile) {
                    setProfileImage(data.imageProfile);
                }
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
            });
    }, []);


    const [errorMessages, setErrorMessages] = useState({
        name: "",
        email: "",
        newPassword: "",
        confirmPassword: "",
        errorField: "",
    });


    const handleFieldChange = (fieldName, value) => {
        validateField(fieldName, value);

        setClientData(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
    };


    const validateField = (name, value) => {
        switch (name) {
            case "name":
                const minCharsConstraintName = new MinCharactersConstraint(
                "El nombre y los apellidos",
                value.trim(),
                2
                );
                const maxCharsConstraintName = new MaxCharactersConstraint(
                "El nombre y los apellidos",
                value.trim(),
                40
                );
                setErrorMessages({
                ...errorMessages,
                [name]:
                    minCharsConstraintName.test() || maxCharsConstraintName.test(),
                });
                break;
            case "email":
                const emailConstraint = new EmailConstraint(name, value.trim());
                setErrorMessages({
                    ...errorMessages,
                    [name]: emailConstraint.test(),
                });
                break;
            case "newPassword":
                const passwordConstraint = new PasswordConstraint(name, value.trim());
                setErrorMessages({
                    ...errorMessages,
                    [name]: passwordConstraint.test(),
                });
                break;
            case "confirmPassword":
                setErrorMessages({
                    ...errorMessages,
                    confirmPassword: "",
                });
                if (value !== clientData.newPassword) {
                    setErrorMessages({
                    ...errorMessages,
                    [name]: "Las contraseñas no coinciden",
                    });
                }
                break;
            default:
                break;
        }
    }


    const handleImageChange = (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const selectedImage = URL.createObjectURL(acceptedFiles[0]);
            setProfileImage(selectedImage);
            setAcceptedFiles(acceptedFiles);
        } else {
            setProfileImage(defaultProfileImage);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        let hasChanges = false;
        let hasChangesPassword = false;

        setErrorMessages({
            ...errorMessages,
            confirmPassword: "",
        });

        Object.keys(clientData).forEach(key => {
            if (key !== "confirmPassword" && key !== "newPassword" && clientData[key] !== initialClientData[key]) {
                formData.append(key, clientData[key]);
                hasChanges = true;
            }
        });


        if (acceptedFiles && acceptedFiles.length > 0) {
            const selectedImage = URL.createObjectURL(acceptedFiles[0]);
            setProfileImage(selectedImage);
            if (selectedImage !== defaultProfileImage) {
                formData.append("profileImage", acceptedFiles[0]);
                hasChanges = true;
            }
        }

        if (clientData.newPassword && clientData.confirmPassword) {
            const newPassword = clientData.newPassword.trim();
            const confirmPassword = clientData.confirmPassword.trim();

            if (confirmPassword === newPassword) {
                changePassword(newPassword);
                hasChangesPassword = true;
            } else {
                setErrorMessages({
                    ...errorMessages,
                    confirmPassword: "Las contraseñas no coinciden",
                });
            }
        }

        const hasFieldErrors = Object.values(errorMessages).some(message => message !== "");

        if (hasFieldErrors) {
            errorMessage("Por favor, corrige los errores en los campos.");
        } else if (hasChanges) {
            try {
                await updateClient(userId, formData);
                successfulMessage("Los cambios se han guardado correctamente.");
            } catch (error) {
                errorMessage("Hubo un error al guardar los cambios.");
            }
        } else if (hasChangesPassword) {
            successfulMessage("La contraseña se ha actualizado correctamente.");
        } else if (!hasChangesPassword && !hasChanges){
            errorMessage("No se han realizado cambios en el formulario. Por favor, modifica algún campo antes de guardar.");
        }
    };

    return (
        <div className="client-information-container container mt-5 mb-5">
            <div className="card client-card">
                <div className="card-header-client custom-header-client">
                    <h3 className="mb-0">
                        <span className="profile-title display-6">Datos Personales</span>
                        <ImProfile className="profile-icon mr-3" />
                    </h3>
                </div>
                <div className="card-body">
                    <div className="profile-image-container">
                        <Dropzone onDrop={handleImageChange}>
                            {({ getRootProps, getInputProps }) => (
                                <div className="dropzone" {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <img src={profileImage} alt="Profile imagen" className="profile-image" />
                                    <p>Arrastra aquí una imagen o haz clic para seleccionarla</p>
                                </div>
                            )}
                        </Dropzone>
                    </div>
                    <div className="form-group row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="name">Nombre y apellidos*</label>
                            <input type="text" className="form-control" id="name" value={clientData.name} onChange={e => handleFieldChange('name', e.target.value)} />
                            <div className="errorMessage">{errorMessages.name}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="username">Nombre de usuario*</label>
                            <input type="text" className="form-control" id="username" value={clientData.username} readOnly disabled />
                        </div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="email">Correo Electrónico*</label>
                        <input type="email" className="form-control" id="email" value={clientData.email} onChange={e => handleFieldChange('email', e.target.value)} />
                        <div className="errorMessage">{errorMessages.email}</div>
                    </div>
                    <div className="form-group row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="newPassword">Nueva Contraseña*</label>
                            <input type="password" className="form-control" value={clientData.newPassword || ''} id="newPassword" onChange={e => handleFieldChange('newPassword', e.target.value)} />
                            <div className="errorMessage">{errorMessages.newPassword}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="confirmPassword">Confirmar Contraseña*</label>
                            <input type="password" className="form-control" value={clientData.confirmPassword || ''} id="confirmPassword" onChange={e => handleFieldChange('confirmPassword', e.target.value)} />
                            <div className="errorMessage">{errorMessages.confirmPassword}</div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn-clientProfile btn btn-primary"
                        onClick={handleSubmit}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ClientProfile;
