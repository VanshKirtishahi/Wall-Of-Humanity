import React, { useEffect, useRef } from 'react';

const DonationMap = ({ donations, userLocation, radius }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Load Google Maps Script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (googleMapRef.current) {
      updateMarkers();
    }
  }, [donations, userLocation, radius]);

  const initializeMap = () => {
    const center = userLocation || { lat: 20.5937, lng: 78.9629 }; // Default to India's center
    
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 10,
      center: center,
      styles: [/* Your custom map styles */]
    });

    // Add circle for radius if user location exists
    if (userLocation) {
      new window.google.maps.Circle({
        map: googleMapRef.current,
        center: userLocation,
        radius: radius * 1000, // Convert km to meters
        fillColor: '#FF0000',
        fillOpacity: 0.1,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });
    }

    updateMarkers();
  };

  const updateMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    donations.forEach(donation => {
      if (donation.coordinates) {
        const marker = new window.google.maps.Marker({
          position: donation.coordinates,
          map: googleMapRef.current,
          title: donation.title,
          icon: {
            url: donation.category === 'food' ? '/food-icon.png' : '/clothing-icon.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        // Add click listener for info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h3>${donation.title}</h3>
              <p>${donation.description}</p>
              <p>Category: ${donation.category}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });

        markersRef.current.push(marker);
      }
    });
  };

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default DonationMap; 