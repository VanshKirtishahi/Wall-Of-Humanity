import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import donationService from '../../services/donation.service';
import DonationCard from './DonationCard';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const donationsData = await donationService.getAllDonations();
        setDonations(donationsData);
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
        setDonations(prev => prev.filter(donation => donation._id !== donationId));
        toast.success('Donation deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
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
    <div className="bg-gray-50 py-8">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Available Donations</h2>
            {user && (
              <Link
                to="/donation-form"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Make a Donation
              </Link>
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
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-700"
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
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-700"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Donations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDonations.map(donation => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isOwner={user?._id === donation.user}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationCart;