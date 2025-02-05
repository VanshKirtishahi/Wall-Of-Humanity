import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import donationService from '../../services/donation.service';
import authService from '../../services/auth.service';
import DonationCard from './DonationCard';
import FreeFoodCard from './FreeFoodCard';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import FreeFoodCart from './FreeFoodCart';

const DonationCart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all'
  });
  const [freeFoodListings, setFreeFoodListings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [donationsData, freeFoodData] = await Promise.all([
          donationService.getAllDonations(),
          api.get('/api/free-food')
        ]);
        
        setDonations(donationsData);
        if (Array.isArray(freeFoodData.data)) {
          setFreeFoodListings(freeFoodData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        toast.error('Failed to load donations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = async (donationId) => {
    navigate(`/donation-form/${donationId}`);
  };

  const handleDelete = async (donationId) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await donationService.deleteDonation(donationId);
        setDonations(donations.filter(donation => donation._id !== donationId));
        toast.success('Donation deleted successfully');
      } catch (error) {
        setError('Failed to delete donation');
        toast.error('Failed to delete donation');
      }
    }
  };

  const filteredDonations = donations.filter(donation => {
    if (filters.type !== 'all' && donation.type !== filters.type) return false;
    if (filters.location !== 'all' && donation.location.city !== filters.location) return false;
    return true;
  });

  const uniqueLocations = [...new Set(donations.map(d => d.location.city))];

  return (
    <div className="container mx-auto px-4 py-8">
      <FreeFoodCart />
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <div>
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Donations</h1>
                <p className="text-gray-600">Browse and request available donations in your area</p>
              </div>
              {user && (
                <div className="flex gap-4">
                  <Link
                    to="/donation-form"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Donation
                  </Link>
                </div>
              )}
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition duration-200 ease-in-out hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="Food">Food</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Books">Books</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition duration-200 ease-in-out hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 focus:outline-none"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Donations Grid */}
          {filteredDonations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <img src="/images/NoDonation.jpg" alt="No donations" className="w-48 h-48 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Donations Available</h3>
              {user && (
                <Link
                  to="/donation-form"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors duration-300"
                >
                  Be the first to donate
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDonations.map(donation => (
                donation.type === 'FreeFood' ? (
                  <FreeFoodCard
                    key={donation._id}
                    freeFood={donation}
                    isOwner={user?._id === donation.uploadedBy}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isOwner={user?._id === donation.user}
                  />
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationCart;