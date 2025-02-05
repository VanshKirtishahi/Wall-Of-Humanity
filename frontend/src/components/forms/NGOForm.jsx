import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ngoService from '../../services/ngo.service';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const NGOForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationEmail: '',
    password: '',
    phoneNumber: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    ngoWebsite: '',
    ngoType: '',
    incorporationDate: new Date(),
    address: '',
    socialMediaLinks: '',
    logo: null,
    certification: null,
    socialPosts: false,
    termsAccepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Check file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
          toast.error('File size must be less than 2MB');
          e.target.value = '';
          return;
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          toast.error('File type must be PDF, JPG, or PNG');
          e.target.value = '';
          return;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Additional validation for required fields
    const requiredFields = [
      'organizationName',
      'organizationEmail',
      'phoneNumber',
      'contactPersonName',
      'contactPersonEmail',
      'contactPersonPhone',
      'ngoType',
      'address'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate files
    if (!formData.logo || !formData.certification) {
      toast.error('Please upload both logo and certification documents');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info('Submitting your NGO registration...');
      
      const response = await ngoService.registerNGO(formData);

      if (response.ngo) {
        toast.success('NGO registration completed! Welcome aboard!');
        setFormData({
          organizationName: '',
          organizationEmail: '',
          password: '',
          phoneNumber: '',
          contactPersonName: '',
          contactPersonEmail: '',
          contactPersonPhone: '',
          ngoWebsite: '',
          ngoType: '',
          incorporationDate: new Date(),
          address: '',
          socialMediaLinks: '',
          logo: null,
          certification: null,
          socialPosts: false,
          termsAccepted: false
        });
        
        // Show thank you message and navigate
        Swal.fire({
          title: 'Thank You!',
          text: 'Your NGO registration has been submitted successfully. We will review your application and get back to you soon.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#6B46C1'
        }).then(() => {
          navigate('/', { 
            state: { 
              registrationSuccess: true,
              message: 'NGO registration completed successfully!' 
            }
          });
        });
      }
    } catch (error) {
      console.error('Error registering NGO:', error);
      toast.error(error.response?.data?.message || error.message || 'Error registering NGO');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-purple-600 mb-2">NGO Registration</h1>
          <p className="text-gray-600">
            Join our platform to expand your reach and make a bigger impact
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 space-y-6">
          {/* Organization Details Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">Organization Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Organization Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="organizationEmail"
                  value={formData.organizationEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Person Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">Contact Person Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Contact Person Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactPersonEmail"
                  value={formData.contactPersonEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Contact Person Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPersonPhone"
                  value={formData.contactPersonPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Organization Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* NGO Details Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">NGO Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  NGO Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="ngoType"
                  value={formData.ngoType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Orphanage">Orphanage</option>
                  <option value="Old-Age Home">Old-Age Home</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Incorporation Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.incorporationDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, incorporationDate: date }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">Additional Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">NGO Website</label>
                <input
                  type="url"
                  name="ngoWebsite"
                  value={formData.ngoWebsite}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Social Media Links</label>
                <input
                  type="text"
                  name="socialMediaLinks"
                  value={formData.socialMediaLinks}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Comma-separated links"
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">Required Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  NGO Logo <span className="text-red-500">*</span>
                  <span className="text-sm text-gray-500 block">
                    (PDF, JPG, JPEG, PNG - Max 2MB)
                  </span>
                </label>
                <input
                  type="file"
                  name="logo"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Certification Document <span className="text-red-500">*</span>
                  <span className="text-sm text-gray-500 block">
                    (PDF, JPG, JPEG, PNG - Max 2MB)
                  </span>
                </label>
                <input
                  type="file"
                  name="certification"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="socialPosts"
                checked={formData.socialPosts}
                onChange={handleChange}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Allow social media posts about our work</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                required
              />
              <span className="text-gray-700">
                I accept the terms and conditions <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold
                hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                transition-colors duration-300
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NGOForm;