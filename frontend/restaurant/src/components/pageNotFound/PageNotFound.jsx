import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
    return (
        <div className="pageNotFound-page mt-5 w-100 d-flex align-items-center justify-content-center">
            <div className="text-center mt-5">
                <h1 className="display-1 fw-bold">404</h1>
                <p className="fs-3"><span className="text-danger">Oops!</span> Página no encontrada.</p>
                <p className="lead">
                    La página que estás buscando no existe.
                </p>
                <Link to="/" className="btn btn-primary">Inicio</Link>
            </div>
        </div>
    );
}

export default PageNotFound;
