import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const MapaCisterna = ({ latitud, longitud }) => {
  const posicion = [parseFloat(latitud), parseFloat(longitud)];

  return (
    <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
      <MapContainer center={posicion} zoom={16} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={posicion}>
          <Popup>
            Cisterna ubicada aquí.<br /> Lat: {latitud}, Long: {longitud}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapaCisterna;
