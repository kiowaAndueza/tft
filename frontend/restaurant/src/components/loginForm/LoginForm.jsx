import React, { useEffect, useState } from "react";
import "./LoginForm.css";
import { Form, Button } from "react-bootstrap";
import { FaRegUserCircle } from "react-icons/fa";
import { EmailConstraint } from "../../validator/emailConstraint";
import { MinCharactersConstraint } from "../../validator/minCharactersConstraint";
import { login, getUserType } from "../../services/authService";
import { successfulMessage } from "../messages/Messages";
import { useNavigate } from "react-router-dom";
import { authProvider } from "../../auth/authProvider";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const redirectToPath = async (path) => {
    await navigate(path);
  };

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const checkPermission = async () => {
    const permissions = await authProvider.getPermissions();
    const hasPermission = permissions.includes("login");

    if (!hasPermission) {
      redirectToPath("/home");
    }
  };

  useEffect(() => {
    checkPermission();
  },);

  const handleInputChange = (e) => {
    setLoginError("");
    const { name, value } = e.target;

    if (name === "email") {
      const emailConstraint = new EmailConstraint(name, value.trim());
      setEmailError(emailConstraint.test());
    } else if (name === "password") {
      const minCharactersConstraint = new MinCharactersConstraint(
        "La contraseña",
        value.trim(),
        8
      );
      setPasswordError(minCharactersConstraint.test());
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoginError("");

    if (!formData.email || !formData.password) {
      setLoginError("Rellena todos los campos obligatorios (*)");
      return;
    }

    try {
      const user = await login(formData.email, formData.password);
      if (user) {
        try {
          const response = await getUserType(user.uid);
          if (response.status === 200) {
            const uid = user.uid;
            const type = response.data.user_type;
            localStorage.setItem("userType", type);
            localStorage.setItem("userId", uid);
            window.location.reload(false);
            await successfulMessage("Inicio de sesión exitoso");

            redirectToPath("/home");
          }
        } catch (error) {
          console.log("Error al obtener el tipo de usuario:", error);
        }
      } else {
        setLoginError("Email o contraseña inválido");
      }
    } catch (error) {
      console.log(error);
      setLoginError("Email o contraseña inválido");
    }
  };

  return (
    <div className="login-form-wrapper">
      <Form onSubmit={handleSubmit} className="login-form">
        <div className="title-container">
          <div className="icon-container">
            <FaRegUserCircle />
          </div>
          <h2>Iniciar sesión</h2>
        </div>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Correo electrónico*:</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-control"
          />
          {emailError && <div className="errorMessage">{emailError}</div>}
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label className="mt-4">Contraseña*:</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-control"
          />
          {passwordError && <div className="errorMessage">{passwordError}</div>}
        </Form.Group>
        {loginError && <div className="errorMessage">{loginError}</div>}
        <Button
          type="submit"
          className="mt-4 btn-company-form btn-block-container"
        >
          <div className="btn-block d-flex justify-content-center w-100">
            Iniciar sesión
          </div>
        </Button>
      </Form>
    </div>
  );
}

export default LoginForm;
