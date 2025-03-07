import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { format, isValid } from 'date-fns';
import { FiEdit2, FiSave, FiX, FiCamera, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../config/axios';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    address: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState(null);

  const defaultAvatar = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  `);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const data = response.data;
        setProfileData(data);
        setEditedData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          phone: data.phone || '',
          address: data.address || ''
        });
        if (data.avatarUrl) {
          setAvatarPreview(data.avatarUrl);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, logout]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      name: profileData.name || '',
      email: profileData.email || '',
      bio: profileData.bio || '',
      phone: profileData.phone || '',
      address: profileData.address || ''
    });
    setAvatarPreview(profileData.avatarUrl);
    setAvatar(null);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setAvatar(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.avatarUrl) {
        return response.data.avatarUrl;
      }
      throw new Error('Failed to get avatar URL');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar to Cloudinary');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let cloudinaryUrl;
      if (avatar) {
        cloudinaryUrl = await handleAvatarUpload(avatar);
        if (!cloudinaryUrl) {
          toast.error('Failed to upload avatar');
          return;
        }
      }

      const updateData = {
        ...editedData,
        avatarUrl: cloudinaryUrl || profileData.avatarUrl
      };

      const response = await api.put('/auth/profile', updateData);
      
      // Update local state and context
      setProfileData(response.data);
      setAvatarPreview(cloudinaryUrl || response.data.avatarUrl);
      
      // Update user context with avatar URL
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        ...response.data,
        avatarUrl: cloudinaryUrl || response.data.avatarUrl 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      setAvatar(null); // Reset avatar state
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/auth/profile');
        localStorage.clear();
        logout();
        toast.success('Account deleted successfully');
        navigate('/login');
      } catch (error) {
        console.error('Delete account error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete account');
        
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date';
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;
    if (avatarPath.startsWith('data:')) return avatarPath; // For preview
    if (avatarPath.startsWith('http')) return avatarPath; // For Cloudinary URLs
    return defaultAvatar; // Fallback to default avatar
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-600">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-purple-400"></div>

          {/* Profile Header */}
          <div className="relative px-6">
            <div className="flex items-center">
              {/* Avatar */}
              <div className="-mt-16 relative">
                <div className="relative">
                  <img
                    src={getAvatarUrl(avatarPreview || profileData?.avatarUrl)}
                    alt={profileData?.name || 'Profile'}
                    className="h-32 w-32 rounded-full border-4 border-white object-cover bg-white shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                  />
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-purple-500 rounded-full p-2 cursor-pointer hover:bg-purple-600 transition-colors">
                      <FiCamera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Name and Email */}
              <div className="ml-6 pt-2">
                <div className="text-2xl font-bold text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.name}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                      className="border-b-2 border-purple-500 focus:outline-none px-1 py-0.5"
                      placeholder="Your name"
                    />
                  ) : (
                    profileData.name
                  )}
                </div>
                <div className="flex items-center mt-1 text-gray-600">
                  <FiMail className="w-4 h-4 mr-2" />
                  {profileData.email}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-6 space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FiX className="w-4 h-4 mr-1.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FiSave className="w-4 h-4 mr-1.5" />
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <FiEdit2 className="w-4 h-4 mr-1.5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6">
            {/* Bio Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
              {isEditing ? (
                <textarea
                  value={editedData.bio}
                  onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {profileData.bio || 'No bio added yet'}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-gray-700 mb-4">
                  <FiPhone className="w-5 h-5 mr-3 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedData.phone}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      className="flex-1 border-b border-gray-300 focus:border-purple-500 focus:outline-none px-1 py-0.5"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <span>{profileData.phone || 'No phone number added'}</span>
                  )}
                </div>
                <div className="flex items-center text-gray-700">
                  <FiMapPin className="w-5 h-5 mr-3 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.address}
                      onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                      className="flex-1 border-b border-gray-300 focus:border-purple-500 focus:outline-none px-1 py-0.5"
                      placeholder="Your address"
                    />
                  ) : (
                    <span>{profileData.address || 'No address added'}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center text-gray-700 mb-4">
                  <FiCalendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Joined {formatDate(profileData.createdAt)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiCalendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Last updated {formatDate(profileData.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <button
              onClick={handleDeleteAccount}
              className="text-red-600 hover:text-red-700 text-sm font-medium focus:outline-none"
            >
              Delete Account
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 