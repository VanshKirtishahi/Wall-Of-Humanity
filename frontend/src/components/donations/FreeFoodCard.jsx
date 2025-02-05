import React from 'react';
import { formatFullAddress } from '../../utils/locationUtils';
import { toast } from 'react-toastify';

const FreeFoodCard = ({ freeFood, isOwner, onEdit, onDelete, showControls = true }) => {
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-venue.jpg';
    return `${import.meta.env.VITE_API_URL}/uploads/free-food/${imagePath}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <img 
        src={getImageUrl(freeFood.venueImage)}
        alt={freeFood.venue || 'Venue'}
        className="w-full h-48 object-cover rounded-lg mb-4"
        onError={(e) => {
          console.error('Image load error for:', freeFood.venueImage);
          e.target.src = '/default-venue.jpg';
          e.target.onerror = null;
        }}
      />
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