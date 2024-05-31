import mapboxgl from 'mapbox-gl';

export interface MapInfo {
    center: mapboxgl.LngLat;
    theme: boolean;
}