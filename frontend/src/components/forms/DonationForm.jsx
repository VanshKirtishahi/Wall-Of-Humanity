import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import donationService from '../../services/donation.service';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { DEFAULT_DONATION_IMAGE, DEFAULT_VENUE_IMAGE } from '../../constants/images';

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
    availability: {
      startTime: '',
      endTime: '',
      notes: ''
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
          const donation = await donationService.getDonationById(id);
          setFormData({
            type: donation.type || 'Food',
            title: donation.title || '',
            description: donation.description || '',
            quantity: donation.quantity || '',
            foodType: donation.foodType || '',
            images: donation.images || [],
            availability: {
              startTime: donation.availability?.startTime || '',
              endTime: donation.availability?.endTime || '',
              notes: donation.availability?.notes || ''
            },
            location: {
              address: donation.location?.address || '',
              area: donation.location?.area || '',
              city: donation.location?.city || '',
              state: donation.location?.state || '',
              coordinates: donation.location?.coordinates || null
            }
          });
          
          updateImagePreview(donation.images);
        } catch (error) {
          if (error.message === 'Authentication required') {
            navigate('/login', { 
              state: { from: `/donation-form/${id}` },
              replace: true 
            });
          } else {
            toast.error('Failed to fetch donation details');
            navigate('/my-donations');
          }
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
      setImagePreview(Array.isArray(images) 
        ? `${baseUrl}/uploads/donations/${images[0]}`
        : `${baseUrl}/uploads/donations/${images}`
      );
    } else {
      setImagePreview(DEFAULT_DONATION_IMAGE);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form data except images
      Object.keys(formData).forEach(key => {
        if (key === 'availability' || key === 'location') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'images') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add image if exists
      if (image) {
        formDataToSend.append('images', image);
      }

      let response;
      if (id) {
        response = await donationService.updateDonation(id, formDataToSend);
      } else {
        response = await donationService.createDonationWithImage(formDataToSend);
      }

      toast.success(`Donation ${id ? 'updated' : 'created'} successfully!`);
      navigate('/my-donations');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit donation');
    } finally {
      setIsLoading(false);
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
                  <span className="bg-purple-100 p-2 rounded-lg mr-2">🍽️</span>
                  Food Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Pickup Time Availability</h3>
                    <div className="tooltip" title="Specify when the food donation can be picked up">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 italic mb-4">
                    Please specify the time window when the food donation will be available for pickup
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        name="availability.startTime"
                        value={formData.availability.startTime}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        name="availability.endTime"
                        value={formData.availability.endTime}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Additional Pickup Instructions</label>
                    <textarea
                      name="availability.notes"
                      value={formData.availability.notes}
                      onChange={handleChange}
                      placeholder="E.g., Please call 10 minutes before pickup, Ring doorbell upon arrival, etc."
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="2"
                    />
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
