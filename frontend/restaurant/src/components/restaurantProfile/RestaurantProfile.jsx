import defaultProfileImage from '../../assets/userDefault.jpg';
import { ImProfile } from 'react-icons/im';
import Dropzone from 'react-dropzone';
import './RestaurantProfile.css';
import React, { useEffect, useState } from 'react';
import { changePassword, getRestaurant, updateRestaurant } from '../../services/authService';
import { errorMessage, successfulMessage } from '../messages/Messages';
import { MaxCharactersConstraint } from '../../validator/maxCharactersConstraint';
import { MinCharactersConstraint } from '../../validator/minCharactersConstraint';
import { EmailConstraint } from '../../validator/emailConstraint';
import { PasswordConstraint } from '../../validator/passwordConstraint';
import { BiCurrentLocation } from 'react-icons/bi';
import { mapSearch } from '../../services/apiService';

function RestaurantProfile() {
    const [profileImage, setProfileImage] = useState(defaultProfileImage);

    const [initialRestaurantData, setInitialRestaurantData] = useState({});
    const [acceptedFiles, setAcceptedFiles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedModalPlace, setSelectedModalPlace] = useState(null);


    const [restaurantData, setRestaurantData] = useState({
        name: '',
        username: '',
        email: '',
        restaurantName: '',
        cif: '',
        city: '',
        province: '',
        number: '',
        cp: '',
        street: '',
        latitude: '',
        longitude: '',
        newPassword: '',
        confirmPassword: '',
        type: "restaurant",
        address: ''
    });

    const [errorMessages, setErrorMessages] = useState({
        name: "",
        email: "",
        restaurantName: "",
        newPassword: "",
        confirmPassword: "",
        errorField: "",
    });

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        getRestaurant(userId)
            .then(response => {
                const data = response.data;
                setRestaurantData(data);
                setInitialRestaurantData(data);
                if (data.imageProfile) {
                    setProfileImage(data.imageProfile);
                    console.log(data)
                }
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
            });
    }, []);


    const handleSelectChange = (index) => {
        if (places[index]) {
            setSelectedModalPlace( places[index]);
            setPlaces('');
        }
    };


    const handleImageChange = (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const selectedImage = URL.createObjectURL(acceptedFiles[0]);
            setProfileImage(selectedImage);
            setAcceptedFiles(acceptedFiles);
        } else {
            setProfileImage(defaultProfileImage);
        }
    };


    const handleModalSubmit = () => {
        if (selectedModalPlace) {
            setRestaurantData((prevData) => ({
                ...prevData,
                street: selectedModalPlace.street,
                number: selectedModalPlace.number,
                city: selectedModalPlace.city,
                cp: selectedModalPlace.cp,
                province: selectedModalPlace.province,
                latitude: selectedModalPlace.latitude,
                longitude: selectedModalPlace.longitude,
            }));
    
            setIsModalOpen(false);
        }
    };


    const performSearch = async (text) => {
        setIsSearching(true);
        setNoResults(false);

        try {
            const response = await mapSearch(text);
            if (Array.isArray(response.data)) {
                setPlaces(response.data);
                setSelectedAddress("");
            } else {
                console.error("Respuesta de API inesperada:", response.data);
                setPlaces([]);
                setSelectedModalPlace('');
                setNoResults(true);
            }
        } catch (error) {
            console.error(error);
            setPlaces([]);
            setNoResults(true);
        } finally {
            setIsSearching(false);
        }
    };




    const handleFieldChange = (fieldName, value) => {
        validateField(fieldName, value);

        setRestaurantData(prevData => ({
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
            case "restaurantName":
                const minCharsConstraintRestaurantName = new MinCharactersConstraint(
                    "El nombre del restaurante",
                    value,
                    1
                );
                setErrorMessages({
                    ...errorMessages,
                    [name]: minCharsConstraintRestaurantName.test(),
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
                if (value !== restaurantData.newPassword) {
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

    const openModal = () => {
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        let hasChanges = false;
        let hasChangesPassword = false;

        setErrorMessages({
            ...errorMessages,
            confirmPassword: "",
        });

        Object.keys(restaurantData).forEach(key => {
            if (key !== "confirmPassword" && key !== "newPassword" && restaurantData[key] !== initialRestaurantData[key]) {
                formData.append(key, restaurantData[key]);
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

        if (restaurantData.newPassword && restaurantData.confirmPassword) {
            const newPassword = restaurantData.newPassword.trim();
            const confirmPassword = restaurantData.confirmPassword.trim();

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
                await updateRestaurant(userId, formData);
                successfulMessage("Los cambios se han guardado correctamente.");
            } catch (error) {
                errorMessage("Hubo un error al guardar los cambios.");
            }
        } else if (hasChangesPassword) {
            successfulMessage("La contraseña se ha actualizado correctamente.");
        } else if (!hasChangesPassword && !hasChanges) {
            errorMessage("No se han realizado cambios en el formulario. Por favor, modifica algún campo antes de guardar.");
        }
    };




    return (
        <div className="restaurant-information-container container mt-5 mb-5">
            <div className="card custom-card">
                <div className="card-header custom-header">
                    <h3 className="mb-0">
                        <span className="profile-title">Datos Personales</span>
                        <ImProfile className="profile-icon mr-2" />
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
                            <input type="text" className="form-control" id="name" value={restaurantData.name} onChange={e => handleFieldChange('name', e.target.value)} />
                            <div className="errorMessage">{errorMessages.name}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="username">Nombre de usuario*</label>
                            <input type="text" className="form-control" id="username" value={restaurantData.username} readOnly disabled />
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="restaurantName">Nombre Restaurante*</label>
                            <input type="text" className="form-control" id="restaurantName" value={restaurantData.restaurantName} onChange={e => handleFieldChange('restaurantName', e.target.value)} />
                            <div className="errorMessage">{errorMessages.restaurantName}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="cif">CIF*</label>
                            <input type="text" className="form-control" id="cif" value={restaurantData.cif} readOnly disabled />
                        </div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="email">Correo Electrónico*</label>
                        <input type="email" className="form-control" id="email" value={restaurantData.email} onChange={e => handleFieldChange('email', e.target.value)} />
                        <div className="errorMessage">{errorMessages.email}</div>
                    </div>
                    <div className="form-group row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="newPassword">Nueva Contraseña*</label>
                            <input type="password" className="form-control" value={restaurantData.newPassword || ''} id="newPassword" onChange={e => handleFieldChange('newPassword', e.target.value)} />
                            <div className="errorMessage">{errorMessages.newPassword}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="confirmPassword">Confirmar Contraseña*</label>
                            <input type="password" className="form-control" value={restaurantData.confirmPassword || ''} id="confirmPassword" onChange={e => handleFieldChange('confirmPassword', e.target.value)} />
                            <div className="errorMessage">{errorMessages.confirmPassword}</div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end form-group mt-3 mb-4">
                        <button
                            className="btn btn-primary btn-changeDirection"
                            onClick={openModal}
                        >
                            Modificar Dirección
                        </button>
                    </div>

                    <div className="modal" tabIndex="-1" role="dialog" style={{ display: isModalOpen ? 'block' : 'none' }}>
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Buscar Dirección</h5>
                                    <button type="button" className="close" onClick={() => setIsModalOpen(false)} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <div className="form-group row mb-3 align-items-center">
                                            <div className="col-9 col-md-9">
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    placeholder="Buscar dirección"
                                                    name="address"
                                                    value={restaurantData.address}
                                                    onChange={(e) => handleFieldChange('address', e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            performSearch(restaurantData.address);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="col-3 col-md-3 biCurrentLocation-icon d-flex justify-content-center">
                                                {isSearching ? (
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="sr-only">Loading...</span>
                                                    </div>
                                                ) : (
                                                    <BiCurrentLocation className="locationIcon" />
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                    {noResults && <p>No se encontraron coincidencias.</p>}
                                    {places.length > 0 && (
                                        <ul className="list-group list-modal col-9 col-md-9 form-group">
                                            {places.map((place, index) => (
                                                <li
                                                    key={index}
                                                    className="list-group-item search-result"
                                                    onClick={() => handleSelectChange(index)}
                                                >
                                                    {place.street}, {place.number}, {place.city}, {place.province}, {place.cp}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {selectedModalPlace && (
                                        <div>
                                            <div className='mb-1'>Dirección seleccionada:</div>
                                            <div>{selectedModalPlace.street}, {selectedModalPlace.number}, {selectedModalPlace.city}, {selectedModalPlace.province}, {selectedModalPlace.cp}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary btn-modal-direction-save" onClick={handleModalSubmit}>Guardar</button>
                                    <button type="button" className="btn btn-secondary btn-modal-direction-close" onClick={() => setIsModalOpen(false)}>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='direction-group'>
                        <div className="form-group row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="street">Calle*</label>
                                <input id="street" className="form-control" name="street" type="text" value={restaurantData.street} readOnly disabled onChange={e => handleFieldChange('street', e.target.value)} />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label htmlFor="number">Nº*</label>
                                <input id="number" className="form-control" name="number" type="number" min="1" value={restaurantData.number} onChange={e => handleFieldChange('number', e.target.value)} />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label htmlFor="cp">Código Postal*</label>
                                <input id="cp" className="form-control" name="cp" type="text"  readOnly disabled value={restaurantData.cp} onChange={e => handleFieldChange('cp', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="city">Ciudad*</label>
                                <input id="city" className="form-control" name="city" type="text" value={restaurantData.city} onChange={e => handleFieldChange('city', e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="province">Provincia*</label>
                                <input className="form-control" id="province" name="province" readOnly disabled type="text" value={restaurantData.province} onChange={e => handleFieldChange('province', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-restaurantProfile btn btn-primary"
                        onClick={handleSubmit}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RestaurantProfile;
