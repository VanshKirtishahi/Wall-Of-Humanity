import React, { useState, useEffect } from 'react';
import { formatFullAddress } from '../../utils/locationUtils';
import { toast } from 'react-toastify';
import apiClient from '../../config/apiConfig';
import { defaultVenue } from '../../assets';

const FreeFoodCard = ({ freeFood, isOwner, onEdit, onDelete, showControls = true }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (freeFood.venueImage) {
      const url = `${import.meta.env.VITE_API_URL}/uploads/free-food/${freeFood.venueImage}`;
      fetch(url, { method: 'HEAD' })
        .then(res => {
          if (!res.ok) throw new Error('Image not found');
          setImageSrc(url);
          setImageError(false);
        })
        .catch(() => {
          setImageSrc(defaultVenue);
          setImageError(true);
        });
    } else {
      setImageSrc(defaultVenue);
      setImageError(true);
    }
  }, [freeFood.venueImage]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailabilityText = () => {
    const { type, specificDate } = freeFood.availability || {};
    
    // Ensure we have a type, defaulting to 'allDays' if not specified
    const availabilityType = type || 'allDays';
    
    switch (availabilityType) {
      case 'specific':
        return specificDate ? `Available on: ${formatDate(specificDate)}` : 'Available on: Date not specified';
      case 'weekdays':
        return 'Available on: Weekdays (Monday-Friday)';
      case 'weekend':
        return 'Available on: Weekends (Saturday-Sunday)';
      case 'allDays':
        return 'Available on: All Days';
      default:
        return 'Available on: All Days'; // Default to all days instead of "not specified"
    }
  };

  const handleGetLocation = () => {
    // Get coordinates from the location object
    const { coordinates } = freeFood.location || {};
    
    // Check if we have valid coordinates
    if (coordinates?.lat && coordinates?.lng) {
      // Use coordinates directly for more accurate location
      const mapUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(mapUrl, '_blank');
    } else {
      // Fallback to address-based location
      const address = formatFullAddress(freeFood.location);
      if (address) {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(mapUrl, '_blank');
      } else {
        toast.error('Location information is not available');
      }
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    setImageSrc(defaultVenue);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="relative">
        <img 
          src={imageSrc}
          alt={freeFood.venue || 'Venue'}
          onError={handleImageError}
          onLoad={() => setImageLoading(false)}
          className={`w-full h-48 object-cover rounded-lg mb-4 transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{freeFood.venue}</h3>
      <p className="text-gray-600 mb-2">Type: {freeFood.foodType}</p>
      <p className="text-gray-600 mb-2 font-medium">{getAvailabilityText()}</p>
      <p className="text-gray-600 mb-2">
        Time: {freeFood.availability?.startTime || 'N/A'} - {freeFood.availability?.endTime || 'N/A'}
      </p>
      <p className="text-gray-600 mb-4">
        Address: {formatFullAddress(freeFood.location)}
      </p>
      
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleGetLocation}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Get Location
        </button>
        
        {showControls && isOwner && (
          <div className="space-x-2">
            <button
              onClick={() => onEdit(freeFood._id)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(freeFood._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeFoodCard; 