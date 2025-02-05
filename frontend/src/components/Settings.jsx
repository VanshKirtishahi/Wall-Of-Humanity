import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.newPassword !== formData.confirmNewPassword) {
        toast.error('New passwords do not match!');
        return;
      }

      if (formData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      // Add your password change API call here
      // await authService.changePassword(formData.currentPassword, formData.newPassword);
      
      toast.success('Password updated successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 