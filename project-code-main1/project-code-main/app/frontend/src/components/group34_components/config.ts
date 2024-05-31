import { latLng, latLngBounds } from 'leaflet';

const currentYear  = new Date().getFullYear();

const config = {
  basename: '',
  defaultPath: '/dashboard/default',
  fontFamily: `'Roboto', sans-serif`,
  borderRadius: 12,
  mapCenter: latLng(53.3811, -1.47), // liverpool
  edgeOfMap: latLngBounds(latLng(-90, -180), latLng(90, 180)),
  minZoom: 3,
  defaultZoom: 6,
  minDistance: 10000,
  minCapacity: 1,
  maxCapacity: 150000,
  step: 5000,
  currentYear: currentYear,
};

export default config;
