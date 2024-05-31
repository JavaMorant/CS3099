import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css'
import { MapData } from '../../interfaces/mapData';
import { MapInfo } from '../../interfaces/mapInfo';

//define interfaces for types
interface MapProps {
  mapData: MapData[] // make this MapData[]
  mapInfo: MapInfo
}

//pass the mapProps to the component
const Map: React.FC<MapProps> = ({ mapData, mapInfo}) => {

    useEffect(() => {
      mapboxgl.accessToken = 'pk.eyJ1IjoidmVyaXR5cG93ZWxsIiwiYSI6ImNsbzBocGNnMDFibnEybG82Nm4xeDk4ZWoifQ.phBiVIOyO9X_MwKcPbgpmA'; 

      const style = mapInfo.theme ? 'mapbox://styles/veritypowell/cltq03i2s002h01r1fl6j7ymp' : 'mapbox://styles/veritypowell/cltq02b9q00a401pjbeca60o9';

      const map = new mapboxgl.Map({
        container: 'map',
        style: style, //style from UI theme
        center: mapInfo.center, // Updated map center coordinates
        zoom: 8, // Initial zoom level
      });
      
      mapData.forEach((mapData, index) => {
      //update the map to have the correct start coords
      if (mapData.teamData.length > 0 && mapData.isDisplayed) {
        for (let i = 0; i < mapData.teamData.length; i++){
          if (mapData.teamData[i].StadiumCoords !== null){
            const rawCoords = mapData.teamData[i].StadiumCoords;
            if (rawCoords !== null) {
              const newCenter = new mapboxgl.LngLat(rawCoords[0], rawCoords[1]);
              mapInfo.center = newCenter;
              break;
            }
          }
        }
      }
      
      const coordsLine: [number, number][] = [];
      let count = 0;
      if (mapData.isDisplayed){
      mapData.teamData.forEach(markerInfo => {
        count++;
        if (markerInfo.StadiumCoords !== null){
          const rawCoords = markerInfo.StadiumCoords;
          if (rawCoords !== null) {
            const newMarker = new mapboxgl.LngLat(rawCoords[0], rawCoords[1]);
            coordsLine.push(rawCoords);
            
            //https://stackoverflow.com/questions/50411046/add-custom-marker-to-mapbox-map
            const customMarkerElement = document.createElement('div');
            customMarkerElement.className = 'custom-marker';
            customMarkerElement.style.backgroundColor = mapData.lineColour; // Set marker color
            customMarkerElement.style.color = mapData.lineColour  === '#ffffff' ? '#000000' : '#ffffff';
            customMarkerElement.style.borderColor = mapData.lineColour  === '#ffffff' ? '#000000' : '#ffffff';
            customMarkerElement.textContent = String(count); // Set the number on the marker
            customMarkerElement.setAttribute('aria-label', 'Marker ' + count + mapData.playerName); // Set an accessible label for the marker
            customMarkerElement.setAttribute('tabIndex', '0'); // Make the marker focusable

            // Create the marker with the custom HTML element
            const marker = new mapboxgl.Marker({
                element: customMarkerElement
              })
              .setLngLat(newMarker)
              .addTo(map);

          var internalHtml = "<div style='color: #000' className='map' tabIndex='0' autofocus><p>"+ mapData.playerName + "</p><a href=\"/stadium\">" + markerInfo.Team_name +"</a></div>"

          if (markerInfo.TeamImage && markerInfo.TeamImage[count-1]){
            var imageUrl = markerInfo.TeamImage[count-1] 
            internalHtml = "<div style='color: #000' className='map ' tabIndex='0' autofocus><p>"+ mapData.playerName + "</p><a href=\"/stadium\"><img src=\"" + imageUrl + "\" alt=\"Image Description\">"+ markerInfo.Team_name+"</a></div>";
          }  
          var popup = new mapboxgl.Popup({ closeButton: true })
            .setHTML(internalHtml)
            .addTo(map);
            
          marker.setPopup(popup);
          popup.remove();
               
          popup.on('close', function() {
              marker.getElement().focus();
          });

  
          marker.getElement().addEventListener('click', function() {
           marker.setPopup(popup);
   
        });

      marker.getElement().addEventListener('keyup', function(event) {
  
        if(event.key === 'Enter' ){
          marker.setPopup(popup);
          const popupContent = document.querySelector('.mapboxgl-popup-content');
          if (popupContent) {
              (popupContent as HTMLElement).focus();
          }

        } 

    });
        

        marker.getElement().addEventListener('keyup', function(event) {
          popup.remove();
          
          if(event.key !== 'Enter'){
            var lngLat = marker.getLngLat();
            map.setCenter(lngLat);
          }

          
  
      });
        
        }
        }
        
       });
      
       if (coordsLine) {
        map.on('load', function() {
          map.addSource(`route-${index}`, {
              'type': 'geojson',
              'data': {
                  'type': 'Feature',
                  'properties': {},
                  'geometry': {
                      'type': 'LineString',
                      'coordinates': coordsLine
                  }
              }
          });
          map.addLayer({
              'id': `route-${index}`,
              'type': 'line',
              'source': `route-${index}`,
              'layout': {
                  'line-join': 'round',
                  'line-cap': 'round'
              },
              'paint': {
                  'line-color': mapData.lineColour,
                  'line-width': 4,
              }
          });
        
    });
    }
  }
    });

      //add controls to the map
      map.addControl(new mapboxgl.NavigationControl());
    
      return () => map.remove();
    }, [mapData, mapInfo]);
    
    
    /**
     * return the map component
     */
    return (
      <div id="map"></div>
    );
  };
  
  export default Map;


