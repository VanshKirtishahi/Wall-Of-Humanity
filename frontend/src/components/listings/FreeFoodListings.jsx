import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import FreeFoodCard from '../donations/FreeFoodCard';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FreeFoodListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await api.get('/free-food');
      setListings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const listing = listings.find(l => l._id === id);
    if (listing && listing.uploadedBy === user?._id) {
      navigate(`/free-food/edit/${id}`);
    } else {
      toast.error('You can only edit your own listings');
    }
  };

  const handleDelete = async (id) => {
    const listing = listings.find(l => l._id === id);
    if (!listing || listing.uploadedBy !== user?._id) {
      toast.error('You can only delete your own listings');
      return;
    }

    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/free-food/${id}`);
        setListings(prevListings => prevListings.filter(listing => listing._id !== id));
        toast.success('Listing deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete listing');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 py-4">Free Food Listings</h1>
          <div className="flex gap-4">
            <Link
              to="/free-food/new"
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition duration-150 ease-in-out shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Listing
            </Link>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-lg mb-6">No free food listings available.</p>
            <Link
              to="/free-food/new"
              className="text-purple-600 hover:text-purple-700 font-medium text-lg hover:underline"
            >
              Create a listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(listing => (
              <FreeFoodCard
                key={listing._id}
                freeFood={listing}
                isOwner={listing.uploadedBy === user?._id}
                onEdit={() => handleEdit(listing._id)}
                onDelete={() => handleDelete(listing._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeFoodListings; 