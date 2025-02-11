import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getCoordinatesFromAddress, formatFullAddress, debounce } from '../../utils/locationUtils';

const DonationModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState(initialData || {
    type: 'Food',
    title: '',
    description: '',
    quantity: '',
    address: '',
    date: new Date(),
    coordinates: null
  });

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      if (userData.address) {
        setFormData(prev => ({
          ...prev,
          address: userData.address
        }));
        updateCoordinates(userData.address);
      }
    }
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);
  const [locationError, setLocationError] = useState('');

  const foodTypes = [
    'Cooked Food',
    'Raw Vegetables',
    'Fruits',
    'Grains',
    'Packaged Food',
    'Beverages',
    'Dairy Products',
    'Other'
  ];

  const updateCoordinates = async () => {
    const fullAddress = formatFullAddress(formData.location);
    if (!fullAddress) return;

    setIsProcessing(true);
    setLocationError('');

    try {
      const coordinates = await getCoordinatesFromAddress(fullAddress);
      if (coordinates) {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates
          }
        }));
      } else {
        setLocationError('Could not find coordinates for this address. Please check the address.');
      }
    } catch (error) {
      setLocationError('Error getting location coordinates. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const debouncedUpdateCoordinates = debounce(updateCoordinates, 1000);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name.split('.')[1]]: value,
        coordinates: null
      }
    }));
    setLocationError('');
    debouncedUpdateCoordinates();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      handleLocationChange(e);
    } else {
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
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location.coordinates) {
      await updateCoordinates();
      if (!formData.location.coordinates) {
        setLocationError('Valid location coordinates are required. Please check the address.');
        return;
      }
    }
    
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? 'Edit Donation' : 'Add New Donation'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Category</option>
                <option value="food">Food</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>
          </div>

          {/* Food-specific Fields */}
          {formData.category === 'food' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Food Type*</label>
                  <select
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Food Type</option>
                    {foodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity*</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g., 5 kg, 20 meals"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              {/* Availability Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time*</label>
                    <input
                      type="time"
                      name="availability.startTime"
                      value={formData.availability?.startTime || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time*</label>
                    <input
                      type="time"
                      name="availability.endTime"
                      value={formData.availability?.endTime || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Availability Notes</label>
                  <textarea
                    name="availability.notes"
                    value={formData.availability?.notes || ''}
                    onChange={handleChange}
                    placeholder="Any special instructions about pickup times..."
                    className="w-full p-2 border rounded-md"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location Section with Error Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location Details</h3>
            {locationError && (
              <div className="text-red-500 text-sm">{locationError}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address*</label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location?.address || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Area*</label>
                <input
                  type="text"
                  name="location.area"
                  value={formData.location?.area || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City*</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location?.city || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State*</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location?.state || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="3"
              placeholder="Additional details about the donation..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, image: reader.result }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {initialData ? 'Update' : 'Add'} Donation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationModal; 