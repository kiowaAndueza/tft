import React, { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./LocationFilterComponent.css";
import { confirmationMessage } from "../../messages/Messages";

function LocationFilterComponent(props) {
  const [location, setLocation] = useState(null);
  const [isGeolocationEnabled, setIsGeolocationEnabled] = useState(false);
  const [rangeValueKm, setRangeValue] = useState(50);

  const { handleLocationChange } = props;

  const locationToParent = () => {
    handleLocationChange(location);
  };

  const requestGeolocationPermission = () => {
    if (!isGeolocationEnabled) {
      confirmationMessage("¿Desea habilitar la geolocalización?").then(
        (result) => {
          if (result.isConfirmed) {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                function (position) {
                  const latitude = position.coords.latitude;
                  const longitude = position.coords.longitude;
                  setLocation({ latitude, longitude, rangeValueKm });
                  locationToParent();
                },
                function (error) {
                  console.error("Error al obtener la ubicación:", error);
                }
              );
              setIsGeolocationEnabled(true);
            } else {
              console.error(
                "Geolocalización no está disponible en este navegador."
              );
            }
          }
        }
      );
    } else {
      confirmationMessage("¿Desea desactivar la geolocalización?").then(
        (result) => {
          if (result.isConfirmed) {
            setIsGeolocationEnabled(false);
            setLocation(null);
            locationToParent();
          }
        }
      );
    }
  };

  const handleRangeChangeKm = (e) => {
    const newRangeValueKm = e.target.value;
    setRangeValue(newRangeValueKm);
    
    if (location) {
      setLocation({ ...location, rangeValueKm: newRangeValueKm });
      locationToParent();
    }
  };

  return (
    <div>
      <div className="row">
        <div className="row">
          <div className="col-3 d-flex align-items-center title-filter-text">
            Ubicación:
          </div>
          <div className="col-9">
            <FaMapMarkerAlt
              className={`location-icon ${
                isGeolocationEnabled ? "enabled-icon" : "disabled-icon"
              }`}
              onClick={requestGeolocationPermission}
            />
          </div>
        </div>

        {isGeolocationEnabled ? (
          <div>
            <div className="input-group mb-4">
              <div className="range-label mf-1 me-2">5km</div>
              <input
                type="range"
                className="form-range custom-range"
                id="customRange"
                min="5"
                max="50"
                step="1"
                value={rangeValueKm}
                onChange={handleRangeChangeKm}
                title={`${rangeValueKm}km`}
              />

              <div className="range-label ms-2">50km</div>
            </div>
          </div>
        ) : (
          <div className="col-11 mb-3 text-location-filter">
            Haga clic en el ícono para habilitar la geolocalización.
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationFilterComponent;
