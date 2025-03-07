import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../config/axios';

const FreeFoodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  
  const foodTypes = [
    'Lunch', 'Dinner', 'Full Meals', 'Prasad', 'Langar', 'Other'
  ];

  const [formData, setFormData] = useState({
    venue: '',
    foodType: '',
    createdAt: new Date().toLocaleDateString(),
    availability: {
      type: 'specific',
      startTime: {
        hours: '12',
        minutes: '00',
        period: 'AM'
      },
      endTime: {
        hours: '12',
        minutes: '00',
        period: 'PM'
      },
      specificDate: new Date().toISOString().split('T')[0]
    },
    organizedBy: '',
    uploadedBy: user?._id || '',
    venueImage: null,
    location: {
      address: '',
      area: '',
      city: '',
      state: '',
      coordinates: {
        lat: null,
        lng: null
      }
    }
  });

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
      const response = await api.get(`/api/free-food/${id}`);
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
        createdAt: listing.createdAt || new Date().toLocaleDateString(),
        availability: {
          type: listing.availability?.type || 'specific',
          startTime: {
            hours: listing.availability?.startTime?.hours || '12',
            minutes: listing.availability?.startTime?.minutes || '00',
            period: listing.availability?.startTime?.period || 'AM'
          },
          endTime: {
            hours: listing.availability?.endTime?.hours || '12',
            minutes: listing.availability?.endTime?.minutes || '00',
            period: listing.availability?.endTime?.period || 'PM'
          },
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
        setImagePreview(`${api.defaults.baseURL}/uploads/free-food/${listing.venueImage}`);
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
    
    if (name.includes('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else if (name.includes('availability.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [field]: value
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateImagePreview = (imageUrl) => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview(DEFAULT_VENUE_IMAGE);
    }
  };

  const handleTimeChange = (timeType, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [timeType]: {
          ...prev.availability[timeType],
          [field]: value
        }
      }
    }));
  };

  const formatTimeForSubmission = (timeObj) => {
    const hours = parseInt(timeObj.hours);
    const adjustedHours = timeObj.period === 'PM' && hours !== 12 
      ? hours + 12 
      : (timeObj.period === 'AM' && hours === 12 ? 0 : hours);
    return `${adjustedHours.toString().padStart(2, '0')}:${timeObj.minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      const submissionData = {
        ...formData,
        availability: {
          ...formData.availability,
          startTime: formatTimeForSubmission(formData.availability.startTime),
          endTime: formatTimeForSubmission(formData.availability.endTime)
        }
      };
      
      Object.keys(submissionData).forEach(key => {
        if (key === 'availability' || key === 'location') {
          formDataToSend.append(key, JSON.stringify(submissionData[key]));
        } else if (key !== 'venueImage') {
          formDataToSend.append(key, submissionData[key]);
        }
      });
      
      if (image) {
        formDataToSend.append('venueImage', image);
      }

      let response;
      if (id) {
        response = await api.put(`/api/free-food/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/api/free-food', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(`Listing ${id ? 'updated' : 'created'} successfully!`);
      navigate('/free-food');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 mt-16">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-purple-100">
        <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">
          {id ? 'Edit Free Food Listing' : 'Create Free Food Listing'}
        </h2>
        
        <div className="space-y-8">
          {/* Venue Information */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <span className="bg-purple-100 p-2 rounded-lg mr-2">📍</span>
              Venue Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                  Venue Name
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-purple-300 shadow-sm 
                    focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                    hover:border-purple-400 transition-colors"
                  required
                  placeholder="Enter venue name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Food Type</label>
                <select
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2"
                  required
                >
                  <option value="">Select Food Type</option>
                  {foodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Organized By</label>
                <input
                  type="text"
                  name="organizedBy"
                  value={formData.organizedBy}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2"
                  required
                  placeholder="Enter organizer name"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <span className="bg-purple-100 p-2 rounded-lg mr-2">📌</span>
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-700">Street Address</label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-purple-300 shadow-sm 
                    focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                    hover:border-purple-400 transition-colors"
                  required
                  placeholder="Enter street address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-700">Area/Locality</label>
                <input
                  type="text"
                  name="location.area"
                  value={formData.location.area}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-purple-300 shadow-sm 
                    focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                    hover:border-purple-400 transition-colors"
                  required
                  placeholder="Enter area or locality"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700">City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-purple-300 shadow-sm 
                    focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                    hover:border-purple-400 transition-colors"
                  required
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700">State</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-purple-300 shadow-sm 
                    focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                    hover:border-purple-400 transition-colors"
                  required
                  placeholder="Enter state"
                />
              </div>
            </div>
          </div>

          {/* Availability Section */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <span className="bg-purple-100 p-2 rounded-lg mr-2">🕒</span>
              Availability
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-700">Availability Type</label>
                <select
                  name="availability.type"
                  value={formData.availability.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2"
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
                    className="mt-1 block w-full rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-2"
                    required={formData.availability.type === 'specific'}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-700">Start Time</label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={formData.availability.startTime.hours}
                      onChange={(e) => handleTimeChange('startTime', 'hours', e.target.value)}
                      className="rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.availability.startTime.minutes}
                      onChange={(e) => handleTimeChange('startTime', 'minutes', e.target.value)}
                      className="rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      {['00', '15', '30', '45'].map(min => (
                        <option key={min} value={min}>{min}</option>
                      ))}
                    </select>
                    <select
                      value={formData.availability.startTime.period}
                      onChange={(e) => handleTimeChange('startTime', 'period', e.target.value)}
                      className="rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700">End Time</label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={formData.availability.endTime.hours}
                      onChange={(e) => handleTimeChange('endTime', 'hours', e.target.value)}
                      className="rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.availability.endTime.minutes}
                      onChange={(e) => handleTimeChange('endTime', 'minutes', e.target.value)}
                      className="rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      {['00', '15', '30', '45'].map(min => (
                        <option key={min} value={min}>{min}</option>
                      ))}
                    </select>
                    <select
                      value={formData.availability.endTime.period}
                      onChange={(e) => handleTimeChange('endTime', 'period', e.target.value)}
                      className="rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <span className="bg-purple-100 p-2 rounded-lg mr-2">📸</span>
              Venue Image
            </h3>
            <div className="space-y-4">
              <div className="flex justify-center items-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-purple-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-purple-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-purple-500">PNG, JPG or GIF (MAX. 5MB)</p>
                  </div>
                  <input 
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-48 w-full object-cover rounded-lg shadow-md" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Created Date Display */}
          <div className="text-right text-sm text-gray-600 mb-4">
            Created: {formData.createdAt}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border-2 border-purple-300 text-purple-700 rounded-lg
                hover:bg-purple-50 hover:border-purple-400 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg
                hover:bg-purple-700 disabled:opacity-50 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                shadow-lg shadow-purple-200"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                id ? 'Update Listing' : 'Create Listing'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FreeFoodForm; 