import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import apiClient from '../../config/apiConfig';

const FreeFoodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const foodTypes = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Beverages',
    'Full Meals',
    'Prasad',
    'Langar',
    'Other'
  ];

  const initialFormData = {
    venue: '',
    foodType: '',
    organizedBy: '',
    availability: {
      type: 'allDays',
      startTime: '',
      endTime: '',
      specificDate: new Date().toISOString().split('T')[0]
    },
    location: {
      address: '',
      area: '',
      city: '',
      state: '',
      coordinates: {
        lat: null,
        lng: null
      }
    },
    venueImage: null
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData || !JSON.parse(userData).token) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/api/free-food/${id}`);
      const listing = response.data;
      
      if (!listing) {
        toast.error('Listing not found');
        navigate('/free-food');
        return;
      }

      // Format the date to YYYY-MM-DD
      const formattedDate = listing.availability?.specificDate 
        ? new Date(listing.availability.specificDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      setFormData({
        venue: listing.venue || '',
        foodType: listing.foodType || '',
        availability: {
          type: listing.availability?.type || 'specific',
          startTime: listing.availability?.startTime || '',
          endTime: listing.availability?.endTime || '',
          specificDate: formattedDate
        },
        organizedBy: listing.organizedBy || '',
        uploadedBy: listing.uploadedBy || user?._id || '',
        venueImage: null,
        location: {
          address: listing.location?.street 
            ? `${listing.location.street}, ${listing.location.city}, ${listing.location.state} ${listing.location.zipCode}`
            : listing.location?.address || '',
          area: listing.location?.area || '',
          city: listing.location?.city || '',
          state: listing.location?.state || '',
          coordinates: {
            lat: listing.location?.latitude || null,
            lng: listing.location?.longitude || null
          }
        }
      });

      // Set image preview if exists
      if (listing.venueImage) {
        setImagePreview(`${import.meta.env.VITE_API_URL}/uploads/free-food/${listing.venueImage}`);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to fetch listing details');
      navigate('/free-food');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else if (name.startsWith('availability.')) {
      const availabilityField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [availabilityField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, venueImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/images/default-venue.jpg';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create FormData object
      const formDataObj = new FormData();
      
      // Append basic fields
      formDataObj.append('venue', formData.venue);
      formDataObj.append('foodType', formData.foodType);
      formDataObj.append('organizedBy', formData.organizedBy || '');

      // Handle availability data
      const availabilityData = {
        type: formData.availability.type,
        startTime: formData.availability.startTime,
        endTime: formData.availability.endTime,
        specificDate: formData.availability.type === 'specific' ? formData.availability.specificDate : null
      };
      formDataObj.append('availability', JSON.stringify(availabilityData));

      // Handle location data
      const locationData = {
        address: formData.location.address,
        area: formData.location.area,
        city: formData.location.city,
        state: formData.location.state,
        coordinates: formData.location.coordinates
      };
      formDataObj.append('location', JSON.stringify(locationData));

      // Handle image
      if (formData.venueImage instanceof File) {
        formDataObj.append('venueImage', formData.venueImage);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      let response;
      if (id) {
        response = await apiClient.put(`/api/free-food/${id}`, formDataObj, config);
      } else {
        response = await apiClient.post('/api/free-food', formDataObj, config);
      }

      toast.success(id ? 'Free food listing updated successfully!' : 'Free food listing created successfully!');
      navigate('/free-food');
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while processing your request';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update submit button text based on whether editing or creating
  const submitButtonText = id ? 'Update Free Food' : 'Create Free Food';

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-16">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-purple-100">
        <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">Create Free Food</h2>
        
        <div className="space-y-8">
          {/* Venue Information */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Venue Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Venue Name</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="Enter venue name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Food Type</label>
                <select
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Food Type</option>
                  {foodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Organized By</label>
                <input
                  type="text"
                  name="organizedBy"
                  value={formData.organizedBy}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="Enter organizer name"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-purple-50 p-6 rounded-lg mt-6">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder="Enter complete street address"
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Area/Locality</label>
                <input
                  type="text"
                  name="location.area"
                  value={formData.location.area}
                  onChange={handleChange}
                  placeholder="Enter area or locality"
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="Enter city name"
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">State</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  placeholder="Enter state name"
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Availability Section */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Availability</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Availability Type</label>
                <select
                  name="availability.type"
                  value={formData.availability.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="specific">Specific Date</option>
                  <option value="weekdays">Weekdays (Mon-Fri)</option>
                  <option value="weekend">Weekend (Sat-Sun)</option>
                  <option value="allDays">All Days</option>
                </select>
              </div>

              {formData.availability.type === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    name="availability.specificDate"
                    value={formData.availability.specificDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required={formData.availability.type === 'specific'}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    name="availability.startTime"
                    value={formData.availability.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">End Time</label>
                  <input
                    type="time"
                    name="availability.endTime"
                    value={formData.availability.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Venue Image</h3>
            <div className="space-y-4">
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Venue preview" 
                    onError={handleImageError}
                    className="mt-2 max-w-xs h-auto"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition duration-150 ease-in-out shadow-md"
            >
              {isLoading ? 'Processing...' : submitButtonText}
            </button>
            <button
              type="button"
              onClick={() => navigate('/free-food')}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition duration-150 ease-in-out shadow-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FreeFoodForm; 