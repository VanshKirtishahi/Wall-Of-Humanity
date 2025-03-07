import React from 'react';
import { formatFullAddress } from '../../utils/locationUtils';
import { toast } from 'react-toastify';
import { DEFAULT_VENUE_IMAGE } from '../../constants/images';

const FreeFoodCard = ({ freeFood, isOwner, onEdit, onDelete, showControls = true, isListing = false }) => {
  const formatAvailability = () => {
    const { availability } = freeFood;
    if (!availability) return 'Not specified';

    const formatTimeWithPeriod = (timeString) => {
      if (!timeString) return 'Not specified';
      
      if (typeof timeString === 'object' && timeString.hours && timeString.minutes && timeString.period) {
        return `${timeString.hours}:${timeString.minutes} ${timeString.period}`;
      }
      
      try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${period}`;
      } catch (error) {
        return 'Not specified';
      }
    };

    const getAvailabilityTypeText = (type) => {
      switch (type) {
        case 'weekdays': return 'Weekdays (Mon-Fri)';
        case 'weekend': return 'Weekend (Sat-Sun)';
        case 'allDays': return 'All Days';
        case 'specific': return 'Specific Date';
        default: return type;
      }
    };

    const startTime = formatTimeWithPeriod(availability.startTime);
    const endTime = formatTimeWithPeriod(availability.endTime);
    const timeRange = `${startTime} - ${endTime}`;

    if (availability.type === 'specific') {
      const date = availability.specificDate ? 
        new Date(availability.specificDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Date not specified';
      return `${date}, ${timeRange}`;
    } else {
      return `${getAvailabilityTypeText(availability.type)}, ${timeRange}`;
    }
  };

  const formatCreatedDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    try {
      if (!imagePath) {
        return DEFAULT_VENUE_IMAGE;
      }
      
      // Return the Cloudinary URL directly
      return imagePath;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return DEFAULT_VENUE_IMAGE;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={getImageUrl(freeFood.venueImage)}
          alt={freeFood.venue}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_VENUE_IMAGE;
          }}
        />
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Created Date */}
        <div className="text-xs text-gray-500 mb-2">
          <strong>Posted on:</strong> {formatCreatedDate(freeFood.createdAt)}
        </div>

        <h3 className="text-xl font-semibold mb-2">{freeFood.venue}</h3>
        {freeFood.organizedBy && (
          <div className="text-sm text-gray-600 mb-2">
            Organized by: {freeFood.organizedBy}
          </div>
        )}
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatAvailability()}
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {formatFullAddress(freeFood.location)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4">
          {isListing ? (
            // Show edit and delete buttons only in FreeFoodListings page
            isOwner ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(freeFood._id)}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(freeFood._id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            ) : null
          ) : (
            // Show only get location button in FreeFoodCart
            <button
              onClick={handleGetLocation}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Get Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeFoodCard; 