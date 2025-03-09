import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import donationService from '../../services/donation.service';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { DEFAULT_DONATION_IMAGE } from '../../constants/images';
import api from '../../services/api';

const DonationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Food',
    title: '',
    description: '',
    quantity: '',
    foodType: '',
    images: [],
    createdAt: new Date().toLocaleDateString(),
    availability: {
      startTime: {
        hours: '12',
        minutes: '00',
        period: 'AM'
      },
      endTime: {
        hours: '12',
        minutes: '00',
        period: 'PM'
      }
    },
    location: {
      address: '',
      area: '',
      city: '',
      state: '',
      coordinates: null
    }
  });

  const foodTypes = [
    'Grains',
    'Prepared Meals',
    'Packaged Food',
    'Other'
  ];

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData || !JSON.parse(userData).token) {
        navigate('/login', { 
          state: { from: `/donation-form${id ? `/${id}` : ''}` },
          replace: true 
        });
        return;
      }

      if (id) {
        try {
          const response = await donationService.getDonationById(id);
          const donation = response.donation;

          if (!donation) {
            toast.error('Donation not found');
            navigate('/my-donations');
            return;
          }

          if (donation.images && donation.images.length > 0) {
            setImagePreview(donation.images[0]);
          }

          setFormData({
            type: donation.type || 'Food',
            title: donation.title || '',
            description: donation.description || '',
            quantity: donation.quantity || '',
            foodType: donation.foodType || '',
            images: donation.images || [],
            createdAt: donation.createdAt || new Date().toLocaleDateString(),
            availability: {
              startTime: parseTimeFromDatabase(donation.availability?.startTime) || {
                hours: '12',
                minutes: '00',
                period: 'AM'
              },
              endTime: parseTimeFromDatabase(donation.availability?.endTime) || {
                hours: '12',
                minutes: '00',
                period: 'PM'
              }
            },
            location: {
              address: donation.location?.address || '',
              area: donation.location?.area || '',
              city: donation.location?.city || '',
              state: donation.location?.state || '',
              coordinates: donation.location?.coordinates || null
            }
          });
        } catch (error) {
          toast.error('Failed to fetch donation details');
        }
      }
    };

    checkAuthAndFetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
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

  const updateImagePreview = (images) => {
    if (images && images.length > 0) {
      setImagePreview(images[0]);
    } else {
      setImagePreview(DEFAULT_DONATION_IMAGE);
    }
  };

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    
    try {
      const response = await api.post('/donations/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.imageUrls;
    } catch (error) {
      toast.error('Failed to upload images');
      return [];
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
    if (!timeObj || !timeObj.hours || !timeObj.minutes || !timeObj.period) {
      return '12:00'; // Default time if invalid
    }

    const hours = parseInt(timeObj.hours);
    let adjustedHours;
    
    if (timeObj.period === 'AM') {
      // Handle 12 AM (midnight)
      adjustedHours = hours === 12 ? 0 : hours;
    } else { // PM
      // Handle 12 PM (noon)
      adjustedHours = hours === 12 ? 12 : hours + 12;
    }
    
    return `${adjustedHours.toString().padStart(2, '0')}:${timeObj.minutes}`;
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedBase64);
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submissionData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        quantity: formData.quantity,
        foodType: formData.foodType,
        status: 'available',
        availability: {
          startTime: formatTimeForSubmission(formData.availability.startTime),
          endTime: formatTimeForSubmission(formData.availability.endTime)
        },
        location: {
          address: formData.location.address,
          area: formData.location.area,
          city: formData.location.city,
          state: formData.location.state,
          coordinates: formData.location.coordinates
        }
      };

      let response;
      if (id) {
        const dataToSend = { ...submissionData };
        
        if (image) {
          const compressedImage = await compressImage(image);
          dataToSend.images = [compressedImage];
        } else if (formData.images && formData.images.length > 0) {
          dataToSend.images = formData.images;
        }

        try {
          response = await donationService.updateDonation(id, dataToSend);

          if (response && response.donation) {
            toast.success('Donation updated successfully!');
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.href = '/my-donations';
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (updateError) {
          throw updateError;
        }
      } else {
        // For create
        const dataToSend = {};
        Object.keys(submissionData).forEach(key => {
          dataToSend[key] = submissionData[key];
        });
        
        if (image) {
          // Convert image to base64
          const base64Image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(image);
          });
          dataToSend.images = [base64Image];
        }
        
        response = await donationService.createDonation(dataToSend);
        
        if (response && response.success) {
          toast.success(response.message || 'Donation created successfully');
          await new Promise(resolve => setTimeout(resolve, 2000));
          if (response.shouldRedirect && response.redirectTo) {
            navigate(response.redirectTo);
          }
        } else {
          throw new Error('Failed to create donation');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const parseTimeFromDatabase = (timeString) => {
    if (!timeString) return { hours: '12', minutes: '00', period: 'AM' };
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      
      // Convert 24-hour format to 12-hour format
      let period = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      
      return {
        hours: displayHour.toString().padStart(2, '0'),
        minutes: minutes,
        period: period
      };
    } catch (error) {
      return { hours: '12', minutes: '00', period: 'AM' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 mt-16">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-purple-100">
          <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">
            {id ? 'Edit Donation' : 'Create New Donation'}
          </h2>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">📦</span>
                Basic Information
              </h3>
              <div>
                <label className="block text-gray-700 mb-2">Type of Donation</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="Food">Food</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quantity</label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {formData.type === 'Food' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Food Type
                  </label>
                  <select
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Food Type</option>
                    {foodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {formData.type === 'Food' && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                  <span className="bg-purple-100 p-2 rounded-lg mr-2">🕒</span>
                  Pickup Timing
                </h3>
                <div className="space-y-6">
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
            )}

            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">📍</span>
                Location Details
              </h3>
              <div>
                <label className="block text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Area</label>
                <input
                  type="text"
                  name="location.area"
                  value={formData.location.area}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">📸</span>
                Upload Images
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/my-donations')}
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
                  id ? 'Update Donation' : 'Create Donation'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
