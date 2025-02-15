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
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (freeFoodListings.length > 0) {
      // Extract unique cities
      const cities = [...new Set(freeFoodListings
        .map(listing => listing.location?.city)
        .filter(Boolean))];
      setAvailableCities(cities.sort());
      
      // Filter listings based on selected city
      const filtered = selectedCity 
        ? freeFoodListings.filter(listing => listing.location?.city === selectedCity)
        : freeFoodListings;
      setFilteredListings(filtered);
    }
  }, [selectedCity, freeFoodListings]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/free-food');
      if (Array.isArray(response.data)) {
        setFreeFoodListings(response.data);
      }
    } catch (error) {
      console.error('Error fetching free food listings:', error);
      setError('Failed to load free food listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/api/free-food/${id}`);
        setFreeFoodListings(prev => prev.filter(item => item._id !== id));
        toast.success('Listing deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete listing');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Free Food Available</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border-purple-300 shadow-sm 
              focus:border-purple-500 focus:ring-purple-500 
              hover:border-purple-400 transition-colors"
          >
            <option value="" className="text-gray-700 font-medium">All Cities</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {user && (
            <Link
              to="/free-food/new"
              className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 text-white rounded-lg
                hover:bg-purple-700 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                shadow-lg shadow-purple-200 flex items-center justify-center"
            >
              Add Free Food
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map(listing => (
          <FreeFoodCard
            key={listing._id}
            freeFood={listing}
            showControls={true}
            isListing={false}
          />
        ))}
      </div>

      {filteredListings.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {selectedCity 
              ? `No free food listings available in ${selectedCity}`
              : 'No free food listings available at the moment.'}
          </p>
          {user && (
            <Link
              to="/free-food/new"
              className="inline-block mt-4 text-purple-600 hover:text-purple-700"
            >
              Be the first to add a listing
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default FreeFoodCart; 