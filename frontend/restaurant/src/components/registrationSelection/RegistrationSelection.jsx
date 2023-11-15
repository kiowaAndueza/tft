import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./RegistrationSelection.css";
import authProvider from "../../auth/authProvider";
import { useNavigate } from "react-router-dom";

function RegistrationSelection() {
  const navigate = useNavigate();

  const redirectToPath = async (path) => {
    await navigate(path);
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

  return (
    <div className="registration-container">
      <div className="registration-header">
        <h1>¡Bienvenido/a!</h1>
        <h2>Seleccione el tipo de usuario que desea</h2>
      </div>
      <div className="registration-options">
        <Link to="/register/restaurant" className="btn-restaurant btn btn-lg">Restaurante</Link>
        <Link to="/register/client" className="btn-client btn btn-lg">Cliente</Link>
      </div>
    </div>
  );
}

export default RegistrationSelection;
