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
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-600">Volunteer Registration</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-gray-700 font-semibold mb-2">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                rows="3"
              ></textarea>
            </div>

            <div>
              <label htmlFor="availability" className="block text-gray-700 font-semibold mb-2">Availability</label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="">Select availability</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="both">Both</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label htmlFor="interests" className="block text-gray-700 font-semibold mb-2">Areas of Interest</label>
              <textarea
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="What areas would you like to help with?"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                rows="3"
              ></textarea>
            </div>

            <div>
              <label htmlFor="experience" className="block text-gray-700 font-semibold mb-2">Previous Volunteer Experience</label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Tell us about your previous volunteer experience (if any)"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                rows="3"
              ></textarea>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-purple-600 text-white px-8 py-3 rounded-lg transition-colors duration-300 
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteerForm;
