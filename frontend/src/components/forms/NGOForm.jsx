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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [certificationPreview, setCertificationPreview] = useState(null);
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
          toast.error('File type must be JPEG, JPG, or PNG');
          e.target.value = '';
          return;
        }

        // Preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (name === 'logo') {
              setLogoPreview(reader.result);
            } else if (name === 'certification') {
              setCertificationPreview(reader.result);
            }
          };
          reader.readAsDataURL(file);
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

      // Create FormData object
      const formDataToSend = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'logo' && key !== 'certification' && formData[key] !== null) {
          if (key === 'incorporationDate') {
            formDataToSend.append(key, formData[key].toISOString());
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Append files
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      if (formData.certification) {
        formDataToSend.append('certification', formData.certification);
      }
      
      const response = await ngoService.registerNGO(formDataToSend);

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
        setLogoPreview(null);
        setCertificationPreview(null);
        
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 mt-16">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-purple-100">
          <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">
            NGO Registration
          </h2>

          <div className="space-y-8">
            {/* Organization Details */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">🏢</span>
                Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Organization Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="organizationEmail"
                    value={formData.organizationEmail}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Person Section */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">👤</span>
                Contact Person Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Contact Person Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactPersonEmail"
                    value={formData.contactPersonEmail}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Contact Person Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPersonPhone"
                    value={formData.contactPersonPhone}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Organization Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* NGO Details Section */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">🏢</span>
                NGO Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    NGO Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ngoType"
                    value={formData.ngoType}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Orphanage">Orphanage</option>
                    <option value="Old-Age Home">Old-Age Home</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Incorporation Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.incorporationDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, incorporationDate: date }))}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>

                <div className="md:col-span-2 group">
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
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">🌐</span>
                Additional Information
              </h3>
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    NGO Website
                  </label>
                  <input
                    type="url"
                    name="ngoWebsite"
                    value={formData.ngoWebsite}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Social Media Links
                  </label>
                  <input
                    type="text"
                    name="socialMediaLinks"
                    value={formData.socialMediaLinks}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    placeholder="Comma-separated links"
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">📄</span>
                Required Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    NGO Logo <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-500 block">
                      (JPG, JPEG, PNG - Max 2MB)
                    </span>
                  </label>
                  <input
                    type="file"
                    name="logo"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                  {logoPreview && (
                    <div className="mt-2">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-purple-700 mb-1.5 group-hover:text-purple-900 transition-colors">
                    Certification Document <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-500 block">
                      (JPG, JPEG, PNG - Max 2MB)
                    </span>
                  </label>
                  <input
                    type="file"
                    name="certification"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="block w-full rounded-lg border-purple-300 shadow-sm 
                      focus:border-purple-500 focus:ring-purple-500 px-4 py-2.5
                      hover:border-purple-400 transition-colors"
                    required
                  />
                  {certificationPreview && (
                    <div className="mt-2">
                      <img
                        src={certificationPreview}
                        alt="Certification Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-2">📝</span>
                Terms and Conditions
              </h3>
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
                  'Submit Registration'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NGOForm;