import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FreeFoodCard from './FreeFoodCard';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const FreeFoodCart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [freeFoodListings, setFreeFoodListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [uniqueLocations, setUniqueLocations] = useState([]);

  useEffect(() => {
    fetchFreeFoodListings();
  }, []);

  const fetchFreeFoodListings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/free-food');
      if (Array.isArray(response.data)) {
        setFreeFoodListings(response.data);
        // Extract unique locations, filter out null/undefined values
        const locations = [...new Set(response.data
          .map(listing => listing.location?.city)
          .filter(city => city))] // Remove null/undefined/empty values
          .sort(); // Sort alphabetically
        setUniqueLocations(locations);
      }
    } catch (error) {
      console.error('Error fetching free food listings:', error);
      setError('Failed to load free food listings');
      toast.error('Failed to load free food listings');
    } finally {
      setIsLoading(false);
    }
  };

  // Improved filtering logic
  const filteredListings = freeFoodListings.filter(listing => {
    if (selectedLocation === 'all') return true;
    return listing.location?.city?.toLowerCase() === selectedLocation.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Free Food</h1>
            <p className="text-gray-600">Browse available free food in your area</p>
          </div>
          {user && (
            <Link
              to="/free-food-form"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Free Food
            </Link>
          )}
        </div>

        {/* Location Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Filter by Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition duration-200 ease-in-out hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Free Food Listings Available</h3>
          {user && (
            <Link
              to="/free-food-form"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors duration-300"
            >
              Create a free food
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.map(listing => (
            <FreeFoodCard
              key={listing._id}
              freeFood={listing}
              showControls={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeFoodCart; 