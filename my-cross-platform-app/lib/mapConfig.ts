// Map Configuration for UrbanShield
export const MAP_CONFIG = {
  // Default region (Cebu City)
  DEFAULT_REGION: {
    latitude: 10.3157,
    longitude: 123.8854,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  
  // OpenStreetMap tile server
  TILE_SERVER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Map styles
  LIGHT_STYLE: [],
  DARK_STYLE: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#242f3e' }]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242f3e' }]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#746855' }]
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ],
  
  // Incident category colors
  CATEGORY_COLORS: {
    crime: '#ef4444',
    fire: '#ff6b35',
    accident: '#f59e0b',
    flood: '#3b82f6',
    landslide: '#8b5cf6',
    earthquake: '#dc2626',
    other: '#737373'
  },
  
  // Severity colors
  SEVERITY_COLORS: {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  },
  
  // Category icons
  CATEGORY_ICONS: {
    crime: 'shield',
    fire: 'flame',
    accident: 'car',
    flood: 'water',
    landslide: 'earth',
    earthquake: 'pulse',
    other: 'ellipsis-horizontal'
  }
};

export default MAP_CONFIG;


