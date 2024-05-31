import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import React from 'react';
import { Link } from 'react-router-dom';
import { LatLng } from 'leaflet';

interface MapContainerLinkProps {
  lat: number;
  lng: number;
}

const url = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

const MapContainerLink = ({ lat, lng }: MapContainerLinkProps) => {
  
  return (
  <Link to={"/Stadium"} title='Click for full Map View'>
    <MapContainer center={[lat, lng]} zoom={8}
    >
      <TileLayer url={url} noWrap={true} />
      <Marker position={[lat, lng]} />
    </MapContainer>
  </Link>);
};

export default MapContainerLink;