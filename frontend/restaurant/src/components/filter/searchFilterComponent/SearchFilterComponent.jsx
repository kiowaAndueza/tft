import React, { useEffect, useState } from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import "./SearchFilterComponent.css";
import { searchProvince } from "../../../services/apiService";
import { DateTimeConstraint } from "../../../validator/dateTimeConstraint";

export function SearchFilterComponent() {
  const [provinces, setProvinces] = useState([]);
  
  const [formData, setFormData] = useState({
    province: "",
    date: "",
    time: "",
    numGuests: "",
  });

  const [errorMessages, setErrorMessages] = useState({
    province: "",
    date: "",
    time: "",
    numGuests: "",
  });

  useEffect(() => {
    searchProvince()
      .then((response) => {
        const provincesData = response.data;
        const sortedProvinces = provincesData.sort((a, b) => a.localeCompare(b));
        setProvinces(sortedProvinces);
      })
      .catch((error) => {
        console.error("Error al obtener las ciudades:", error);
      });
  }, []);

  useEffect(() => {
    const storedFormData = JSON.parse(localStorage.getItem("formData"));
    if (storedFormData) {
      setFormData(storedFormData);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    setErrorMessages({ ...errorMessages, [name]: "" });
  };

  const validateDateTime = () => {
    const { date, time } = formData;
    if (date && time) {
      const dateTimeValue = `${date}T${time}:00`;
      const dateTimeConstraint = new DateTimeConstraint("", dateTimeValue);
  
      if (!dateTimeConstraint.validate()) {
        throw new Error(dateTimeConstraint.getMessage());
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldsToValidate = {
      province: "Selecciona una provincia",
      date: "Selecciona una fecha",
      time: "Selecciona una hora",
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
      newErrorMessages.numGuests = "El nº  de comensales debe ser mayor de 0";
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

    localStorage.setItem("formData", JSON.stringify(formData));
    window.location.reload();
  };

  return (
    <div className="container d-flex justify-content-center row mb-5">
      <div className="col-12 col-md-12 col-lg-12 col-xs-12 search-filter">
        <h3 className="mb-3 search-title-filter">Buscar</h3>
        <form className="form-group">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <FaMapMarkerAlt className="home-icon-filter" />
              </span>
            </div>
            <select
              className="form-control"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
            >
              <option value="">Selecciona una ciudad/provincia</option>
              {provinces.map((province, index) => (
                <option key={index} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            {errorMessages.province && (
              <div className="text-danger">{errorMessages.province}</div>
            )}
          </div>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <FaCalendarAlt className="home-icon-filter" />
              </span>
            </div>
            <input
              type="date"
              className="form-control"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            {errorMessages.date && (
              <div className="text-danger">{errorMessages.date}</div>
            )}
          </div>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <FaClock className="home-icon-filter" />
              </span>
            </div>
            <input
              type="time"
              className="form-control"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            {errorMessages.time && (
              <div className="text-danger">{errorMessages.time}</div>
            )}
          </div>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <FaUsers className="home-icon-filter" />
              </span>
            </div>
            <input
              type="number"
              className="form-control"
              placeholder="Comensales"
              name="numGuests"
              step="1"
              min="1"
              value={formData.numGuests}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            {errorMessages.numGuests && (
              <div className="text-danger">{errorMessages.numGuests}</div>
            )}
          </div>
          <div className="row mb-3">
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-block btn-home"
              type="submit"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SearchFilterComponent;
