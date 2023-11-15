import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const MapComponent = ({ latitude, longitude, name }) => {
  if (latitude === null || longitude === null) {
    return <div>No hay coordenadas disponibles</div>;
  }

  const position = [latitude, longitude];

  return (
    <div>
      <div style={{ width: "100%", height: "20em" }}>
        <MapContainer
          center={position}
          zoom={13}
          minZoom={8}
          maxZoom={15}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker
            center={position}
            color="red"
            radius={30}
          >
            <Popup>{name}</Popup>
          </CircleMarker>
        </MapContainer>
      </div>
    </div>
  );
};
