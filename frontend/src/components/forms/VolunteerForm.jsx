import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { volunteerService } from "../../services/volunteer.service";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const VolunteerForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    availability: '',
    interests: '',
    experience: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'address', 'availability', 'interests'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          toast.error(`Please fill in ${field}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      const response = await volunteerService.register(formData);
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        interests: '',
        availability: '',
        experience: ''
      });

      // Show success message
      Swal.fire({
        title: 'Thank You for Volunteering!',
        text: 'Your application has been received. We appreciate your willingness to help the community.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6B46C1'
      }).then(() => {
        navigate('/', {
          state: {
            volunteerSuccess: true,
            message: 'Volunteer registration successful!'
          }
        });
      });

    } catch (error) {
      console.error('Volunteer registration error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit volunteer application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 mt-16">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-purple-100">
          <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">
            Volunteer Registration
          </h2>

          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">👤</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  >
                    <option value="">Select availability</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="both">Both</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Areas of Interest <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    rows="3"
                    placeholder="What areas would you like to help with?"
                    required
                  ></textarea>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Previous Volunteer Experience
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    rows="3"
                    placeholder="Tell us about your previous volunteer experience (if any)"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2.5 border-2 border-purple-300 text-purple-700 rounded-lg
                  hover:bg-purple-50 hover:border-purple-400 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg
                  hover:bg-purple-700 disabled:opacity-50 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                  shadow-lg shadow-purple-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerForm;
