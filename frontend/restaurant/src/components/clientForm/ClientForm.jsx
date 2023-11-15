import React, { useEffect } from "react";
import "./ClientForm.css";
import { useState } from "react";
import { EmailConstraint } from "../../validator/emailConstraint";
import { MinCharactersConstraint } from "../../validator/minCharactersConstraint";
import { MaxCharactersConstraint } from "../../validator/maxCharactersConstraint";
import { PasswordConstraint } from "../../validator/passwordConstraint";
import { clientRegister } from "../../services/authService";
import { successfulMessage } from "../messages/Messages";
import { useNavigate } from "react-router-dom";
import authProvider from "../../auth/authProvider";
import { UsernameConstraint } from "../../validator/usernameConstraint";

export function ClientForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "@",
    email: "",
    password: "",
    confirmPassword: "",
    type: "client",
  });

  const handleFileLinkClick = (fileName) => {
    const url = `/${encodeURIComponent(fileName)}`;
    window.open(url, "_blank");
  };

  const redirectToPath = (path) => {
    navigate(path);
  };

  const checkPermission = async () => {
    const permissions = await authProvider.getPermissions();
    const hasPermission = permissions.includes("register");

    if (!hasPermission) {
      redirectToPath("/home");
    }
  };

  useEffect(() => {
    checkPermission();
  },);

  const [errorMessages, setErrorMessages] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAndConditions: "",
    errorField: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    validateField(name, value);
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
          value,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasErrors = false;

    setErrorMessages({
      confirmPassword: "",
      errorField: "",
      termsAndConditions: "",
    });

    const requiredFields = [
      "name",
      "username",
      "email",
      "password",
      "confirmPassword",
    ];

    requiredFields.forEach((field) => {
      if (formData[field].trim() === "") {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          errorField: "Rellena todos los campos obligatorios(*)",
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
        const response = await clientRegister(formData);
        if (response.status === 200) {
          successfulMessage("Se ha registrado correctamente").then(() => {
            redirectToPath("/login");
          });
        } else {
          console.log("El formulario contiene errores", formData);
        }
      } catch (error) {
        if (error.response.data.error === "El email ya se encuentra registrado") {
          setErrorMessages({
            ...errorMessages,
            email: "El email ya se encuentra registrado",
            username: "",
            cif: ""
          });
        } else if (error.response.data.message === "El nombre de usuario ya existe") {
          setErrorMessages({
            ...errorMessages,
            email: "",
            username: "El nombre de usuario ya existe",
            cif: ""
          });
        } else {
          console.log(error);
        }
      }
    }
  };

  return (
    <div className="container-client-form container mt-5 mb-5">
      <div className="row d-flex justify-content-center align-items-center">
        <div class="col-md-6 mb-4">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-md-9">
                <div class="text-center clientText">
                  <h2 class="mb-4 font-weight-light">¡Bienvenido/a!</h2>
                  <p class="mb-4 font-weight-light">
                    Nuestra plataforma te permite encontrar el restaurante ideal
                    en tan solo un par de clics. Si disfrutas de la buena comida
                    y siempre estás buscando nuevas experiencias culinarias,
                    este es tu sitio. Te ofrecemos la opción de reservar mesa de
                    manera fácil, rápida y segura desde casa.
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
            <h2 className="client-title card-header">Cliente</h2>
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
                <div className="mt-3 form-group">
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
                      {errorMessages.errorField}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="btn-clientRegister btn btn-primary"
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
