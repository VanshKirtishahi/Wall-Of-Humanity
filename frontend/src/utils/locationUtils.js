// Calculate distance between two coordinates using the Haversine formula
export const calculateDistance = (coords1, coords2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
  const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
};

// Function to get coordinates from address with better error handling
export const getCoordinatesFromAddress = async (address) => {
  if (!address) return null;
  
  try {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      return null;
    }

    // Make the API request
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check API response status
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn('No location found for the given address');
      return null;
    } else {
      console.error('Geocoding API error:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};

// Format full address with validation
export const formatFullAddress = (location) => {
  if (!location) return '';
  
  const { address, area, city, state } = location;
  const parts = [];
  
  if (address) parts.push(address.trim());
  if (area) parts.push(area.trim());
  if (city) parts.push(city.trim());
  if (state) parts.push(state.trim());
  
  return parts.join(', ');
};

// Validate coordinates
export const isValidCoordinates = (coordinates) => {
  if (!coordinates) return false;
  const { lat, lng } = coordinates;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

// Sample data with valid coordinates
export const sampleDonations = [
  {
    id: 1,
    title: "Fresh Vegetables",
    category: "food",
    description: "Assorted fresh vegetables from local farm",
    location: {
      address: "123 Main Street",
      area: "Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    foodType: "Raw Vegetables",
    quantity: "10 kg",
    availability: {
      startTime: "09:00",
      endTime: "17:00",
      notes: "Available during business hours"
    },
    image: "/food-sample-1.jpg"
  },
  {
    id: 2,
    title: "Winter Clothing",
    category: "clothing",
    description: "Warm jackets and sweaters",
    coordinates: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
    image: "/clothing-sample-1.jpg",
    size: "Mixed sizes"
  }
]; 

// Debounce utility function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}; 