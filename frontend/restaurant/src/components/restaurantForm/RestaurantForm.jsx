import React, { useEffect, useState } from "react";
import "./RestaurantForm.css";
import { EmailConstraint } from "../../validator/emailConstraint";
import { MinCharactersConstraint } from "../../validator/minCharactersConstraint";
import { MaxCharactersConstraint } from "../../validator/maxCharactersConstraint";
import { CifConstraint } from "../../validator/cifConstraint";
import { PasswordConstraint } from "../../validator/passwordConstraint";
import { restaurantRegister } from "../../services/authService";
import { successfulMessage } from "../messages/Messages";
import { useNavigate } from "react-router-dom";
import { mapSearch } from "../../services/apiService";
import { BiCurrentLocation } from "react-icons/bi";
import authProvider from "../../auth/authProvider";
import { UsernameConstraint } from "../../validator/usernameConstraint";

export function RestaurantForm() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const handleFileLinkClick = (fileName) => {
    const url = `/${encodeURIComponent(fileName)}`;
    window.open(url, "_blank");
  };
  

  const redirectToPath = (path) => {
    navigate(path);
  };

  const [formData, setFormData] = useState({
    name: "",
    username: "@",
    email: "",
    restaurantName: "",
    cif: "",
    password: "",
    confirmPassword: "",
    city: "",
    province: "",
    number: "",
    cp: "",
    street: "",
    latitude: "",
    longitude: "",
    type: "restaurant",
  });

  const [errorMessages, setErrorMessages] = useState({
    name: "",
    username: "",
    email: "",
    restaurantName: "",
    cif: "",
    password: "",
    confirmPassword: "",
    address: "",
    errorField: "",
  });

  const checkPermission = async () => {
    const permissions = await authProvider.getPermissions();
    const hasPermission = permissions.includes("register");

    if (!hasPermission) {
      redirectToPath("/home");
    }
  };

  useEffect(() => {
    if (searchText.trim() !== "") {
      performSearch();
    }
  }, [searchText]);

  useEffect(() => {
    if (searchResults.length > 0) {
      setSelectedAddress(false);
    }
  }, [searchResults]);

  useEffect(() => {
    checkPermission();
  }, []);

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
      case "username":
        const usernameConstraint = new UsernameConstraint(name, value.trim());
        setErrorMessages({
          ...errorMessages,
          [name]: usernameConstraint.test(),
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
      case "cif":
        const cifConstraint = new CifConstraint(name, value);
        setErrorMessages({
          ...errorMessages,
          [name]: cifConstraint.test(),
        });
        break;
      case "password":
        const passwordConstraint = new PasswordConstraint(name, value.trim());
        setErrorMessages({
          ...errorMessages,
          [name]: passwordConstraint.test(),
        });
        break;
      case "confirmPassword":
        if (value.trim() !== formData.password) {
          setErrorMessages({
            ...errorMessages,
            [name]: "Las contraseñas no coinciden",
          });
        } else {
          setErrorMessages({
            ...errorMessages,
            [name]: "",
          });
        }
        break;
      default:
        break;
    }
  };

  const handleSelectChange = (index) => {
    const selectedValue = places[index];

    setFormData((prevData) => ({
      ...prevData,
      street: selectedValue.street,
      number: selectedValue.number,
      city: selectedValue.city,
      province: selectedValue.province,
      cp: selectedValue.cp,
      latitude: selectedValue.latitude,
      longitude: selectedValue.longitude,
    }));

    setSelectedAddress(true);
    setPlaces([]);
    setSearchText("");
  };

  const performSearch = async (text) => {
    setIsSearching(true);
    try {
      const response = await mapSearch(text);
      if (Array.isArray(response.data)) {
        setPlaces(response.data);
        setSelectedAddress(false);
        setNoResults(response.data.length === 0);
      } else {
        console.error("Respuesta de API inesperada:", response.data);
        setPlaces([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasErrors = false;

    setErrorMessages({
      confirmPassword: "",
      address: "",
      errorField: "",
    });

    const requiredFields = [
      "name",
      "restaurantName",
      "email",
      "username",
      "password",
      "confirmPassword",
    ];
    const addressFields = ["street", "number", "cp", "province", "city"];

    Object.entries(formData).forEach(([key, value]) => {
      if (requiredFields.includes(key) && value.trim() === "") {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          errorField: "Rellena todos los campos obligatorios(*)",
        }));
        hasErrors = true;
      }
      if (addressFields.includes(key) && value.trim() === "") {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          address:
            "Busca la dirección presionando la tecla Enter y rellena todos sus respectivos campos",
        }));
        hasErrors = true;
      }
    });

    if (formData.confirmPassword !== formData.password) {
      setErrorMessages((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Las contraseñas no coinciden",
      }));
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("El formulario contiene errores");
    } else {
      try {
        const response = await restaurantRegister(formData);
        if (response.status === 200) {
          successfulMessage("Se ha registrado correctamente").then(() => {
            redirectToPath("/login");
          });
        } else {
          console.log("El formulario contiene errores", formData);
        }
      } catch (error) {
        if (
          error.response.data.error === "El email ya se encuentra registrado"
        ) {
          setErrorMessages({
            ...errorMessages,
            email: "El email ya se encuentra registrado",
            username: "",
            cif: "",
          });
        } else if (
          error.response.data.message === "El nombre de usuario ya existe"
        ) {
          setErrorMessages({
            ...errorMessages,
            email: "",
            username: "El nombre de usuario ya existe",
            cif: "",
          });
        } else if (
          error.response.data.error === "El cif ya se encuentra registrado"
        ) {
          setErrorMessages({
            ...errorMessages,
            email: "",
            username: "",
            cif: "El CIF ya se encuentra registrado",
          });
        } else {
          console.log(error);
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "address") {
      setSearchText(value);
    } else if (
      name === "number" ||
      name === "city" ||
      name === "name" ||
      name === "username" ||
      name === "email" ||
      name === "cif" ||
      name === "restaurantName" ||
      name === "confirmPassword" ||
      name === "password"
    ) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      setSelectedAddress(false);
    }
    validateField(name, value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      e.preventDefault();
      performSearch(searchText);
    }
  };

  return (
    <div className="container-restaurant-form container mt-5 mb-5">
      <div className="row d-flex justify-content-center align-items-center">
        <div class="col-md-6 mb-4">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-md-9">
                <div class="text-center restaurant-Text">
                  <h2 class="mb-4 font-weight-light">¡Bienvenido/a!</h2>
                  <p class="mb-4 font-weight-light">
                    En nuestra plataforma ofrecemos una serie de ventajas
                    exclusivas para tu negocio de restaurante, totalmente
                    gratuitas. Al registrarte, tendrás la oportunidad de
                    aumentar la visibilidad de tu negocio e incrementar tus
                    ganancias.
                  </p>
                  <p class="mb-4 font-weight-light">
                    ¿Quieres llegar a más personas y ofrecer una experiencia
                    única en tu restaurante? Con nosotros puede publicar toda la
                    información sobre tu negocio y permitir que los usuarios
                    reserven de forma rápida y sencilla.
                  </p>
                  <p class="mb-4 font-weight-light">
                    No esperes más para unirte a nuestra comunidad. ¡Te estamos
                    esperando!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <h2 className="restaurant-title card-header">Restaurante</h2>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group row">
                  <div className="col-md-6">
                    <label htmlFor="name">Nombre y apellidos*</label>
                    <input
                      id="name"
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    <div className="errorMessage">{errorMessages.name}</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="username">Nombre de usuario*</label>
                    <input
                      id="username"
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                    <div className="errorMessage">{errorMessages.username}</div>
                  </div>
                </div>
                <div className="mt-3 form-group row">
                  <div className="col-md-6">
                    <label htmlFor="restaurantName">Nombre Restaurante*</label>
                    <input
                      id="restaurantName"
                      type="text"
                      className="form-control"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleInputChange}
                    />
                    <div className="errorMessage">
                      {errorMessages.restaurantName}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="cif">CIF*</label>
                    <input
                      id="cif"
                      type="text"
                      className="form-control"
                      name="cif"
                      value={formData.cif}
                      onChange={handleInputChange}
                    />
                    <div className="errorMessage">{errorMessages.cif}</div>
                  </div>
                </div>
                <div className="mt-3 col-md-12">
                  <label htmlFor="email">Correo Electrónico*</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <div className="errorMessage">{errorMessages.email}</div>
                </div>
                <div className="mt-3 form-group row">
                  <div className="col-md-6">
                    <label htmlFor="password">Contraseña*</label>
                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <div className="errorMessage">{errorMessages.password}</div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="confirmPassword">
                      Confirmar Contraseña*
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <div className="errorMessage">
                      {errorMessages.confirmPassword}
                    </div>
                  </div>
                </div>
                <div className="searchText mt-3">
                  <div className="row">
                    <div className="col-md-12 mb-1">Buscar la dirección:</div>
                  </div>
                  <div className="row mb-3 align-items-center">
                    <div className="col-9 col-md-9">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Buscar dirección"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                      />
                    </div>
                    <div className="col-3 col-md-2 d-flex justify-content-center">
                      {isSearching ? (
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        <BiCurrentLocation className="locationIcon" />
                      )}
                    </div>
                  </div>
                  {noResults && !isSearching && (
                    <div>No se encontraron coincidencias.</div>
                  )}
                </div>
                {places.length > 0 && !selectedAddress && (
                  <ul className="list-group col-md-9 form-group mt-2">
                    {places.map((place, index) => (
                      <li
                        key={index}
                        className="list-group-item search-result"
                        onClick={() => handleSelectChange(index)}
                      >
                        {place.street}, {place.number}, {place.city},{" "}
                        {place.province}
                      </li>
                    ))}
                  </ul>
                )}

                {selectedAddress && (
                  <div>
                    <div className="form-group row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="street">Calle*</label>
                        <input
                          id="street"
                          className="form-control"
                          name="street"
                          type="text"
                          value={formData.street}
                          onChange={handleInputChange}
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="number">Nº*</label>
                        <input
                          id="number"
                          className="form-control"
                          name="number"
                          type="number"
                          value={parseInt(formData.number)}
                          onChange={handleInputChange}
                          min="1"
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="cp">Código Postal*</label>
                        <input
                          id="cp"
                          className="form-control"
                          name="cp"
                          type="text"
                          value={formData.cp}
                          onChange={handleInputChange}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                    <div className="mt-3 form-group row">
                      <div className="col-md-6">
                        <label htmlFor="city">Ciudad*</label>
                        <input
                          id="city"
                          className="form-control"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                        <div className="errorMessage">{errorMessages.city}</div>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="province">Provincia*</label>
                        <input
                          id="province"
                          className="form-control"
                          name="province"
                          type="text"
                          value={formData.province}
                          onChange={handleInputChange}
                          readOnly
                          disabled
                        />
                        <div className="errorMessage">
                          {errorMessages.province}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-5 form-group">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      required
                    />
                    <label
                      className="form-check-label"
                      htmlFor="termsAndConditions"
                    >
                      Acepto los{" "}
                      <span
                        className="link-style"
                        onClick={() =>
                          handleFileLinkClick("Terminos-de-uso.pdf")
                        }
                      >
                        Términos de Uso
                      </span>{" "}
                      y{" "}
                      <span
                        className="link-style"
                        onClick={() =>
                          handleFileLinkClick("Politica-de-privacidad.pdf")
                        }
                      >
                        Política de Privacidad
                      </span>
                    </label>
                    <div className="errorMessage">
                      {errorMessages.address || errorMessages.errorField}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="btn-restaurantRegister btn btn-primary"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
