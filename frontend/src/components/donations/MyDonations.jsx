import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import donationService from '../../services/donation.service';
import DonationCard from './DonationCard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../config/axios';

const MyDonations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { 
          state: { from: '/my-donations' },
          replace: true 
        });
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/donations/my-donations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data) {
          setDonations(response.data);
          setError('');
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { state: { from: '/my-donations' } });
        } else {
          setError('Failed to fetch donations');
          toast.error('Failed to fetch donations');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (location.state?.donationSuccess) {
      setShowMessage(true);
      setMessage(location.state.message);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleEdit = (id) => {
    navigate(`/donation-form/${id}`);
  };

  const handleDelete = async (donationId) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await donationService.deleteDonation(donationId);
        setDonations(donations.filter(d => d._id !== donationId));
        toast.success('Donation deleted successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        toast.error('Failed to delete donation', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {showMessage && (
          <div className="fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
            {message}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 py-4">My Donations</h1>
          <Link
            to="/donation-form"
            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition duration-150 ease-in-out shadow-md"
          >
            Create New Donation
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <img src="/images/donate.jpg" alt="No donations" className="w-48 h-48 mx-auto mb-6" />
            <p className="text-gray-600 text-lg mb-6">You haven't created any donations yet.</p>
            <Link
              to="/donation-form"
              className="text-purple-600 hover:text-purple-700 font-medium text-lg hover:underline"
            >
              Create your first donation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {donations.map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onEdit={() => handleEdit(donation._id)}
                onDelete={() => handleDelete(donation._id)}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDonations; 