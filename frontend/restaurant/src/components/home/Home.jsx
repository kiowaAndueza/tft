import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';
import "./Home.css";
import { searchProvince } from '../../services/apiService';
import { DateTimeConstraint } from '../../validator/dateTimeConstraint';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [provinces, setProvinces] = useState([]);

  const navigate = useNavigate();

  const redirectToPath = async (path) => {
    await navigate(path);
  };

  const [formData, setFormData] = useState({
    province: "",
    date: "",
    time: "",
    numGuests: "",
  });

  const [errorMessages, setErrorMessages] = useState({
    province: '',
    date: '',
    time: '',
    numGuests: '',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessages({ ...errorMessages, [name]: '' });
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
      province: 'Selecciona una provincia',
      date: 'Selecciona una fecha',
      time: 'Selecciona una hora',
      numGuests: 'Ingresa el nº de comensales',
    };

    const newErrorMessages = {};

    for (const fieldName in fieldsToValidate) {
      if (!formData[fieldName]) {
        newErrorMessages[fieldName] = fieldsToValidate[fieldName];
      }
    }

    const numGuests = parseInt(formData.numGuests);
    if (isNaN(numGuests) || numGuests < 1) {
      newErrorMessages.numGuests = 'El nº  de comensales debe ser mayor de 0';
    }

    try {
      validateDateTime();
    } catch (error) {
      newErrorMessages.date = error.message;
    }

    setErrorMessages(newErrorMessages);

    if (Object.values(newErrorMessages).some((message) => message !== '')) {
      return;
    }

    localStorage.setItem('formData', JSON.stringify(formData));

    redirectToPath("/search_restaurants")
  };


  return (
    <div className="container-fluid home-page-full">
      <div className="home-container">
        <div className="text-home mb-3">
          <h1 className="display-4 text-center home-title">Reserva en un solo clic</h1>
          <p className="lead text-center slogan-text">Planificar tus comidas nunca ha sido tan fácil. Encuentra los mejores restaurantes de tu zona.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row justify-content-center">
            <div className="col-lg-3 col-md-12 col-sm-12 col-12 mb-3">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <FaMapMarkerAlt className='home-icon' />
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
              {errorMessages.province && (
                <div className="text-danger">{errorMessages.province}</div>
              )}
            </div>
            <div className="col-lg-2 col-md-12 col-sm-12 col-12 mb-3">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <FaCalendarAlt className='home-icon' />
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
              {errorMessages.date && (
                <div className="text-danger">{errorMessages.date}</div>
              )}
            </div>
            <div className="col-lg-2 col-md-12 col-sm-12 col-12 mb-3">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <FaClock className='home-icon' />
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
              {errorMessages.time && (
                <div className="text-danger">{errorMessages.time}</div>
              )}
            </div>
            <div className="col-lg-3 col-md-12 col-sm-12 col-12 mb-3">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <FaUsers className='home-icon' />
                  </span>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Comensales"
                  name="numGuests"
                  step="1"
                  value={formData.numGuests}
                  onChange={handleInputChange}
                />
              </div>
              {errorMessages.numGuests && (
                <div className="text-danger">{errorMessages.numGuests}</div>
              )}
            </div>
            <div className="col-lg-2 col-md-12 col-sm-12 col-12 mb-3">
              <button
                onClick={handleSubmit}
                className="btn btn-primary btn-block btn-home"
                type="submit"
              >
                Buscar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
