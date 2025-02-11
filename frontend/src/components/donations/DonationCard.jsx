import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { calculateDistance, formatDistance, formatFullAddress } from '../../utils/locationUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { DEFAULT_DONATION_IMAGE } from '../../constants/images';

const DonationCard = ({ donation, onEdit, onDelete, isOwner, userLocation }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const getDistanceText = () => {
    if (!userLocation || !donation.coordinates) return '';
    const distance = calculateDistance(userLocation, donation.coordinates);
    return formatDistance(distance);
  };

  // Format availability time
  const formatAvailability = (availability) => {
    if (!availability) return '';
    const { startTime, endTime, notes } = availability;
    let availText = '';
    
    if (startTime && endTime) {
      availText = `${startTime} - ${endTime}`;
    }
    
    if (notes) {
      availText += availText ? ` (${notes})` : notes;
    }
    
    return availText;
  };

  // Format location
  const formatLocation = (location) => {
    if (!location) return '';
    const { address, area, city, state } = location;
    return [address, area, city, state].filter(Boolean).join(', ');
  };

  const handleGetLocation = () => {
    const { coordinates } = donation.location || {};
    if (coordinates?.lat && coordinates?.lng) {
      const mapUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(mapUrl, '_blank');
    } else {
      // If no coordinates, try to open with address
      const address = formatFullAddress(donation.location);
      if (address) {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(mapUrl, '_blank');
      } else {
        alert('Location information is not available');
      }
    }
  };

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    navigate('/request-form', { 
      state: { donationId: donation._id }
    });
  };

  const LoginPrompt = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="mb-6">Please login to request this donation.</p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login', { 
              state: { from: location.pathname } 
            })}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Login
          </button>
          <button
            onClick={() => setShowLoginPrompt(false)}
            className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const getImageUrl = (imagePath) => {
    try {
      if (Array.isArray(imagePath) && imagePath[0]) {
        const baseUrl = import.meta.env.VITE_API_URL.replace('http://', 'https://');
        return `${baseUrl}/uploads/donations/${imagePath[0]}`;
      }
      if (typeof imagePath === 'string') {
        const baseUrl = import.meta.env.VITE_API_URL.replace('http://', 'https://');
        return `${baseUrl}/uploads/donations/${imagePath}`;
      }
      return DEFAULT_DONATION_IMAGE;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return DEFAULT_DONATION_IMAGE;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Card Image */}
      <div className="relative h-56">
        <img
          src={getImageUrl(donation.images)}
          alt={donation.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image load error for:', donation.title);
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = DEFAULT_DONATION_IMAGE;
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50" />
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            donation.type === 'Food' ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
          }`}>
            {donation.type}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{donation.title}</h3>
        <div className="text-sm text-gray-600 mb-2">
          Donated by: {donation.donorName || 'Anonymous'}
        </div>
        <p className="text-gray-600 mb-4">{donation.description}</p>
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          {donation.type === 'Food' && donation.foodType && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Type:</span> {donation.foodType}
              {donation.quantity && ` (${donation.quantity})`}
            </div>
          )}

          {donation.availability && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatAvailability(donation.availability)}
            </div>
          )}

          {donation.location && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {formatFullAddress(donation.location)}
            </div>
          )}

          {getDistanceText() && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Distance:</span> {getDistanceText()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4">
          {isOwner ? (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(donation._id)}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(donation._id)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleRequestClick}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Request
              </button>
              <button
                onClick={handleGetLocation}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Get Location
              </button>
            </div>
          )}
        </div>
      </div>
      {showLoginPrompt && <LoginPrompt />}
    </div>
  );
};

export default DonationCard; 