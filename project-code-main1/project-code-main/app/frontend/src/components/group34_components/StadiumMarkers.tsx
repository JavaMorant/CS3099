import React from 'react';
import { Link } from 'react-router-dom';

import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L, { MarkerCluster, latLng } from 'leaflet';
import { Stadium } from '../../api/services/stadiums';

import './StadiumMarkers.css'; // Import CSS file for custom styles

const createClusterCustomIcon = function (cluster: MarkerCluster) {
  return new L.DivIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(30, 30, true)
  });
};

const StadiumMarkers: React.FC<{ stadiums: Stadium[] }> = ({ stadiums }) => {
  return (
    <MarkerClusterGroup
      iconCreateFunction={createClusterCustomIcon}
      maxClusterRadius={100}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}>
      {stadiums.map((stadium) => (
        <Marker position={latLng(stadium.coordinates)} key={crypto.randomUUID()}>
          <Popup>
            <h2 className="text-lg font-bold text-center">{stadium.name}</h2>
            <img src={stadium.image_url}></img>
            <p>Capacity: {stadium.capacity}</p>
            <p>
              {stadium.team_id.startsWith('Q') ? (
                <Link to={`/team/${stadium.team_id}`}>Team: {stadium.team}</Link>
              ) : (
                <>Team: {stadium.team}</>
              )}
            </p>
          </Popup>
        </Marker>
      ))}
      ;
    </MarkerClusterGroup>
  );
};

export default StadiumMarkers;
